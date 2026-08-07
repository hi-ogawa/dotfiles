#!/usr/bin/env node

import { execFile } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { parseArgs, promisify } from "node:util";

const usage = `\
usage:
  ho-bj start <slug> [-C <root>] [--wait-timeout <seconds> | --no-wait] -- <command> [args...]
  ho-bj list
  ho-bj logs <slug> [--lines <count>]
  ho-bj stop <slug>
  ho-bj stop --all`;

const sessionName = "ho-bj";
// Keep the shared session alive without exposing its reserved window as a user job.
const shellWindowName = "__ho_bj_shell";

const execFileAsync = promisify(execFile);

async function main() {
  const parsed = parseArguments();
  switch (parsed.action) {
    case "start":
      return startJob(parsed);
    case "stop":
      return stopJobs(parsed);
    case "list":
      return listJobs();
    case "logs":
      return showLogs(parsed);
  }
}

async function startJob({ slug, root, commandArgs, noWait, waitTimeoutMs }) {
  // Keep all background jobs as named windows in one shared tmux session.
  if (!(await hasSession())) {
    await runTmux(["new-session", "-d", "-s", sessionName, "-n", shellWindowName]);
  }

  const windows = await listWindowNames();
  if (windows.includes(slug)) {
    fail(`job already exists: ${slug}`);
  }

  let temporaryDirectory;
  let capturePath;
  if (!noWait) {
    // Capture early output so the caller can see whether the job started successfully.
    temporaryDirectory = mkdtempSync(join(tmpdir(), "ho-bj."));
    capturePath = join(temporaryDirectory, "startup.log");
    writeFileSync(capturePath, "");
  }

  let paneId;
  let started = false;
  let cleanedUp = false;

  // Stop capturing output and remove a partially initialized window on failure.
  async function cleanup() {
    if (cleanedUp) {
      return;
    }
    cleanedUp = true;
    if (paneId) {
      // pipe-pane without a command closes tmux's pane-level output pipe.
      if (capturePath) {
        await runTmux(["pipe-pane", "-t", paneId]).catch(() => {});
      }
      if (!started) {
        await runTmux(["kill-window", "-t", paneId]).catch(() => {});
      }
    }
    if (temporaryDirectory) {
      rmSync(temporaryDirectory, { recursive: true, force: true });
    }
  }

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.once(signal, async () => {
      await cleanup();
      process.exit(130);
    });
  }

  async function start() {
    // Create the window with a placeholder shell so capture is ready before the job starts.
    paneId = await runTmux([
      "new-window",
      "-d",
      "-P",
      "-F",
      "#{pane_id}",
      "-t",
      `=${sessionName}:`,
      "-n",
      slug,
      "-c",
      root,
    ]);
    await runTmux(["set-option", "-w", "-t", paneId, "remain-on-exit", "on"]);
    await runTmux(["set-option", "-w", "-t", paneId, "@ho-bj-root", root]);
    await runTmux([
      "set-option",
      "-w",
      "-t",
      paneId,
      "@ho-bj-command",
      commandArgs.map(shellQuote).join(" "),
    ]);
    if (capturePath) {
      await runTmux(["pipe-pane", "-t", paneId, `cat >> ${shellQuote(capturePath)}`]);
    }

    const command = `exec ${commandArgs.map(shellQuote).join(" ")}`;
    await runTmux(["respawn-pane", "-k", "-t", paneId, "-c", root, command]);
    started = true;
    if (noWait) {
      console.error(`ho-bj: ${slug} started`);
      return;
    }

    // Wait until the job exits or its startup output has been quiet for one second.
    await pollUntil(
      async () => {
        const dead = await runTmux(["display-message", "-p", "-t", paneId, "#{pane_dead}"]);
        if (dead === "1") {
          return { state: "done" };
        }
        const size = statSync(capturePath).size;
        if (size === 0) {
          return { state: "pending" };
        }
        return { state: "ready", value: size };
      },
      { intervalMs: 100, timeoutMs: waitTimeoutMs, idlePollLimit: 10 },
    );

    // Close the pipe before reading to avoid racing with writes to the capture file.
    await runTmux(["pipe-pane", "-t", paneId]);
    const output = readFileSync(capturePath);
    if (output.length > 0) {
      process.stdout.write("--- ho-bj: startup output ---\n");
      process.stdout.write(output);
      if (output.at(-1) !== 0x0a) {
        process.stdout.write("\n");
      }
      process.stdout.write("--- ho-bj: end startup output ---\n");
    }

    // A dead pane represents a startup failure; a live pane is left for later attachment.
    const dead = await runTmux(["display-message", "-p", "-t", paneId, "#{pane_dead}"]);
    if (dead === "1") {
      const status = await runTmux(["display-message", "-p", "-t", paneId, "#{pane_dead_status}"]);
      console.error(`ho-bj: ${slug} exited with status ${status}`);
      process.exitCode = Number(status);
      return;
    }

    console.error(`ho-bj: ${slug} is running`);
  }

  try {
    await start();
  } finally {
    await cleanup();
  }
}

async function stopJobs({ slug, all }) {
  if (!(await hasSession())) {
    console.error(all ? "ho-bj: no jobs to stop" : `ho-bj: ${slug} is not running`);
    return;
  }

  if (all) {
    await runTmux(["kill-session", "-t", `=${sessionName}`]);
    console.error("ho-bj: all jobs stopped");
    return;
  }

  const windows = await listWindowNames();
  if (!windows.includes(slug)) {
    console.error(`ho-bj: ${slug} is not running`);
    return;
  }
  await runTmux(["kill-window", "-t", `=${sessionName}:=${slug}`]);
  console.error(`ho-bj: ${slug} stopped`);
}

async function listJobs() {
  if (!(await hasSession())) {
    console.error("ho-bj: no jobs");
    return;
  }

  const output = await runTmux([
    "list-windows",
    "-t",
    `=${sessionName}`,
    "-F",
    "#{window_name}\t#{?pane_dead,exited,running}\t#{pane_dead_status}\t#{@ho-bj-root}\t#{@ho-bj-command}",
  ]);
  const jobs = output.split("\n").filter((line) => line && !line.startsWith(`${shellWindowName}\t`));
  if (jobs.length > 0) {
    console.log(jobs.join("\n"));
  } else {
    console.error("ho-bj: no jobs");
  }
}

async function showLogs({ slug, lines }) {
  if (!(await hasSession())) {
    console.error(`ho-bj: ${slug} is not running`);
    return;
  }

  const windows = await listWindowNames();
  if (!windows.includes(slug)) {
    console.error(`ho-bj: ${slug} is not running`);
    return;
  }

  const output = await runTmux([
    "capture-pane",
    "-p",
    "-S",
    `-${lines}`,
    "-t",
    `=${sessionName}:=${slug}`,
  ]);
  if (output) {
    console.log(output);
  } else {
    console.error(`ho-bj: ${slug} has no output`);
  }
}

function parseArguments() {
  const argv = process.argv.slice(2);
  const [action, ...args] = argv;
  switch (action) {
    case "list":
      if (args.length !== 0) {
        fail(usage, { status: 2 });
      }
      return { action };
    case "logs":
      return parseLogsArguments(args);
    case "stop":
      if (args.length !== 1) {
        fail(usage, { status: 2 });
      }
      if (args[0] === "--all") {
        return { action, all: true };
      }
      validateSlug(args[0]);
      return { action, all: false, slug: args[0] };
    case "start":
      return parseStartArguments(args);
    default:
      fail(usage, { status: 2 });
  }
}

function parseLogsArguments(args) {
  let parsed;
  try {
    parsed = parseArgs({
      args,
      options: {
        lines: { type: "string" },
      },
      allowPositionals: true,
    });
  } catch {
    fail(usage, { status: 2 });
  }

  const [slug = "", ...extra] = parsed.positionals;
  if (extra.length > 0) {
    fail(usage, { status: 2 });
  }
  validateSlug(slug);

  const lines = Number(parsed.values.lines ?? 200);
  if (!Number.isSafeInteger(lines) || lines <= 0) {
    fail(`invalid line count: ${parsed.values.lines}`, { status: 2 });
  }
  return { action: "logs", slug, lines };
}

function parseStartArguments(argv) {
  // Leave everything after "--" untouched for the job.
  const separator = argv.indexOf("--");
  if (separator === -1) {
    fail(usage, { status: 2 });
  }
  const commandArgs = argv.slice(separator + 1);
  let parsed;
  try {
    parsed = parseArgs({
      args: argv.slice(0, separator),
      options: {
        root: { type: "string", short: "C" },
        "no-wait": { type: "boolean" },
        "wait-timeout": { type: "string" },
      },
      allowPositionals: true,
    });
  } catch {
    fail(usage, { status: 2 });
  }
  const [slug = "", ...extra] = parsed.positionals;
  if (extra.length > 0 || commandArgs.length === 0) {
    fail(usage, { status: 2 });
  }
  validateSlug(slug);

  const noWait = parsed.values["no-wait"] ?? false;
  const waitTimeout = parsed.values["wait-timeout"];
  if (noWait && waitTimeout !== undefined) {
    fail(usage, { status: 2 });
  }
  const waitTimeoutSeconds = Number(waitTimeout ?? 5);
  if (!Number.isFinite(waitTimeoutSeconds) || waitTimeoutSeconds <= 0) {
    fail(`invalid wait timeout: ${waitTimeout}`, { status: 2 });
  }

  // Make the root absolute before passing it to tmux.
  const requestedRoot = parsed.values.root ?? process.cwd();
  const root = resolve(requestedRoot);
  if (!statSync(root, { throwIfNoEntry: false })?.isDirectory()) {
    fail(`job root not found: ${requestedRoot}`);
  }
  return {
    action: "start",
    slug,
    root,
    commandArgs,
    noWait,
    waitTimeoutMs: waitTimeoutSeconds * 1000,
  };
}

function validateSlug(slug) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    fail(`invalid job slug: ${slug}`, { status: 2 });
  }
}

async function hasSession() {
  try {
    await runTmux(["has-session", "-t", `=${sessionName}`]);
    return true;
  } catch (error) {
    if (error.cause?.code === 1) {
      return false;
    }
    throw error;
  }
}

async function listWindowNames() {
  const output = await runTmux(["list-windows", "-t", `=${sessionName}`, "-F", "#{window_name}"]);
  return output ? output.split("\n") : [];
}

async function runTmux(args) {
  try {
    const { stdout } = await execFileAsync("tmux", args, { encoding: "utf8" });
    return stdout.trim();
  } catch (error) {
    throw new Error((error.stderr ?? "").trim() || error.message, { cause: error });
  }
}

async function pollUntil(sample, { intervalMs, timeoutMs, idlePollLimit }) {
  const deadline = Date.now() + timeoutMs;
  let previousValue;
  let hasValue = false;
  let idlePolls = 0;
  while (true) {
    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) {
      return;
    }
    await sleep(Math.min(intervalMs, remainingMs));
    const result = await sample();
    if (result.state === "done") {
      return;
    }
    if (result.state === "pending") {
      continue;
    }
    if (hasValue && Object.is(result.value, previousValue)) {
      if (++idlePolls >= idlePollLimit) {
        return;
      }
    } else {
      previousValue = result.value;
      hasValue = true;
      idlePolls = 0;
    }
  }
}

function shellQuote(value) {
  return `'${value.replaceAll("'", "'\\''")}'`;
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function fail(message, { status = 1 } = {}) {
  console.error(message);
  process.exit(status);
}

main().catch((error) => {
  fail(`ho-bj: ${error.message}`);
});
