#!/usr/bin/env node

import { execFile } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { parseArgs, promisify } from "node:util";

const usage = "usage: ho-bj start <slug> [-C <root>] -- <command> [args...]";
const sessionName = "ho-bj";
const execFileAsync = promisify(execFile);

async function main() {
  const { slug, root, commandArgs } = parseArguments();

  // Keep all background jobs as named windows in one shared tmux session.
  try {
    await runTmux(["has-session", "-t", `=${sessionName}`]);
  } catch {
    await runTmux(["new-session", "-d", "-s", sessionName, "-n", "shell"]);
  }

  const windows = (
    await runTmux(["list-windows", "-t", `=${sessionName}`, "-F", "#{window_name}"])
  ).split("\n");
  if (windows.includes(slug)) {
    fail(`job already exists: ${slug}`);
  }

  // Capture early output so the caller can see whether the job started successfully.
  const temporaryDirectory = mkdtempSync(join(tmpdir(), "ho-bj."));
  const capturePath = join(temporaryDirectory, "startup.log");
  writeFileSync(capturePath, "");

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
      await runTmux(["pipe-pane", "-t", paneId]).catch(() => {});
      if (!started) {
        await runTmux(["kill-window", "-t", paneId]).catch(() => {});
      }
    }
    rmSync(temporaryDirectory, { recursive: true, force: true });
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
    await runTmux(["pipe-pane", "-t", paneId, `cat >> ${shellQuote(capturePath)}`]);

    const command = `exec ${commandArgs.map(shellQuote).join(" ")}`;
    await runTmux(["respawn-pane", "-k", "-t", paneId, "-c", root, command]);
    started = true;

    // Wait until the job exits or its startup output has been quiet for 500 ms.
    let lastSize = 0;
    let idlePolls = 0;
    for (let poll = 0; poll < 50; poll++) {
      await sleep(100);
      const size = statSync(capturePath).size;
      if (size !== lastSize) {
        lastSize = size;
        idlePolls = 0;
      } else if (size > 0) {
        idlePolls++;
      }

      const dead = await runTmux(["display-message", "-p", "-t", paneId, "#{pane_dead}"]);
      if (dead === "1" || idlePolls >= 5) {
        break;
      }
    }

    // Close the pipe before reading to avoid racing with writes to the capture file.
    await runTmux(["pipe-pane", "-t", paneId]);
    const output = readFileSync(capturePath);
    if (output.length > 0) {
      process.stdout.write(output);
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

function parseArguments() {
  // Leave everything after "--" untouched for the job.
  const argv = process.argv.slice(2);
  const separator = argv.indexOf("--");
  if (separator === -1) {
    fail(usage, { status: 2 });
  }
  const commandArgs = argv.slice(separator + 1);
  let parsed;
  try {
    parsed = parseArgs({
      args: argv.slice(0, separator),
      options: { root: { type: "string", short: "C" } },
      allowPositionals: true,
    });
  } catch {
    fail(usage, { status: 2 });
  }
  const [action, slug = "", ...extra] = parsed.positionals;
  if (action !== "start" || extra.length > 0 || commandArgs.length === 0) {
    fail(usage, { status: 2 });
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    fail(`invalid job slug: ${slug}`, { status: 2 });
  }

  // Make the root absolute before passing it to tmux.
  const requestedRoot = parsed.values.root ?? process.cwd();
  const root = resolve(requestedRoot);
  if (!statSync(root, { throwIfNoEntry: false })?.isDirectory()) {
    fail(`job root not found: ${requestedRoot}`);
  }
  return { slug, root, commandArgs };
}

function fail(message, { status = 1 } = {}) {
  console.error(message);
  process.exit(status);
}

async function runTmux(args) {
  try {
    const { stdout } = await execFileAsync("tmux", args, { encoding: "utf8" });
    return stdout.trim();
  } catch (error) {
    throw new Error((error.stderr ?? "").trim() || error.message);
  }
}

function shellQuote(value) {
  return `'${value.replaceAll("'", "'\\''")}'`;
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

main().catch((error) => {
  fail(`ho-bj: ${error.message}`);
});
