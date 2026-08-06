#!/usr/bin/env node

import { execFile } from "node:child_process";
import { mkdtempSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const usage = "usage: ho-bj start <slug> [-C <root>] -- <command> [args...]";
const execFileAsync = promisify(execFile);

async function main() {
  // Parse the wrapper arguments while leaving everything after "--" for the job.
  const args = process.argv.slice(2);
  if (args.shift() !== "start") {
    fail(usage, { status: 2 });
  }

  const slug = args.shift() ?? "";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    fail(`invalid job slug: ${slug}`, { status: 2 });
  }

  let root = process.cwd();
  while (args.length > 0 && args[0] !== "--") {
    if (args.shift() !== "-C" || args.length === 0) {
      fail(usage, { status: 2 });
    }
    root = args.shift();
  }
  if (args.shift() !== "--" || args.length === 0) {
    fail(usage, { status: 2 });
  }

  // Resolve the root before passing it to tmux so the job has a stable working directory.
  try {
    root = realpathSync(root);
    if (!statSync(root).isDirectory()) {
      throw new Error();
    }
  } catch {
    fail(`job root not found: ${root}`);
  }

  // Keep all background jobs as named windows in one shared tmux session.
  if (
    (
      await runTmux(["has-session", "-t", "=ho-bj"], { allowFailure: true })
    ).status !== 0
  ) {
    await runTmux(["new-session", "-d", "-s", "ho-bj", "-n", "shell"]);
  }

  const windows = (
    await runTmux(["list-windows", "-t", "=ho-bj", "-F", "#{window_name}"])
  ).stdout
    .trimEnd()
    .split("\n");
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
      await runTmux(["pipe-pane", "-t", paneId], { allowFailure: true });
      if (!started) {
        await runTmux(["kill-window", "-t", paneId], { allowFailure: true });
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

  try {
    // Create the window with a placeholder shell so capture is ready before the job starts.
    paneId = (
      await runTmux([
        "new-window",
        "-d",
        "-P",
        "-F",
        "#{pane_id}",
        "-t",
        "=ho-bj:",
        "-n",
        slug,
        "-c",
        root,
      ])
    ).stdout.trim();
    await runTmux(["set-option", "-w", "-t", paneId, "remain-on-exit", "on"]);
    await runTmux(["pipe-pane", "-t", paneId, `cat >> ${shellQuote(capturePath)}`]);

    const command = `exec ${args.map(shellQuote).join(" ")}`;
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

      const dead = (
        await runTmux(["display-message", "-p", "-t", paneId, "#{pane_dead}"])
      ).stdout.trim();
      if (dead === "1" || idlePolls >= 5) {
        break;
      }
    }

    // Close the pipe before reading to avoid racing with writes to the capture file.
    await runTmux(["pipe-pane", "-t", paneId], {
      allowFailure: true,
    });
    const output = readFileSync(capturePath);
    if (output.length > 0) {
      process.stdout.write(output);
    }

    // A dead pane represents a startup failure; a live pane is left for later attachment.
    const dead = (
      await runTmux(["display-message", "-p", "-t", paneId, "#{pane_dead}"])
    ).stdout.trim();
    if (dead === "1") {
      const status = Number(
        (
          await runTmux(["display-message", "-p", "-t", paneId, "#{pane_dead_status}"])
        ).stdout.trim(),
      );
      console.error(`ho-bj: ${slug} exited with status ${status}`);
      process.exitCode = status;
      return;
    }

    console.error(`ho-bj: ${slug} is running; attach with: tmux attach -t ho-bj`);
  } finally {
    await cleanup();
  }
}

function fail(message, { status = 1 } = {}) {
  console.error(message);
  process.exit(status);
}

async function runTmux(args, { allowFailure = false } = {}) {
  try {
    const result = await execFileAsync("tmux", args, { encoding: "utf8" });
    return { ...result, status: 0 };
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error("tmux not found");
    }
    if (allowFailure) {
      return {
        stdout: error.stdout ?? "",
        stderr: error.stderr ?? "",
        status: typeof error.code === "number" ? error.code : 1,
      };
    }
    throw new Error((error.stderr ?? "").trim() || `tmux exited with status ${error.code}`);
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
