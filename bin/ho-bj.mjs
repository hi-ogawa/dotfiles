#!/usr/bin/env node

import { execFile as execFileCallback } from "node:child_process";
import {
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const usage = "usage: ho-bj start <slug> [-C <root>] -- <command> [args...]";
const execFile = promisify(execFileCallback);

main().catch((error) => fail({ message: `ho-bj: ${error.message}` }));

async function main() {
  const args = process.argv.slice(2);
  if (args.shift() !== "start") {
    fail({ message: usage, status: 2 });
  }

  const slug = args.shift() ?? "";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    fail({ message: `invalid job slug: ${slug}`, status: 2 });
  }

  let root = process.cwd();
  while (args.length > 0 && args[0] !== "--") {
    if (args.shift() !== "-C" || args.length === 0) {
      fail({ message: usage, status: 2 });
    }
    root = args.shift();
  }
  if (args.shift() !== "--" || args.length === 0) {
    fail({ message: usage, status: 2 });
  }

  try {
    root = realpathSync(root);
    if (!statSync(root).isDirectory()) {
      throw new Error();
    }
  } catch {
    fail({ message: `job root not found: ${root}` });
  }

  if ((await runTmux({
    args: ["has-session", "-t", "=ho-bj"],
    allowFailure: true,
  })).status !== 0) {
    await runTmux({ args: ["new-session", "-d", "-s", "ho-bj", "-n", "shell"] });
  }

  const windows = (await runTmux({
    args: ["list-windows", "-t", "=ho-bj", "-F", "#{window_name}"],
  })).stdout.trimEnd().split("\n");
  if (windows.includes(slug)) {
    fail({ message: `job already exists: ${slug}` });
  }

  const temporaryDirectory = mkdtempSync(join(tmpdir(), "ho-bj."));
  const capturePath = join(temporaryDirectory, "startup.log");
  writeFileSync(capturePath, "");

  let paneId;
  let started = false;
  let cleanedUp = false;
  async function cleanup() {
    if (cleanedUp) {
      return;
    }
    cleanedUp = true;
    if (paneId) {
      await runTmux({ args: ["pipe-pane", "-t", paneId], allowFailure: true });
      if (!started) {
        await runTmux({ args: ["kill-window", "-t", paneId], allowFailure: true });
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
    paneId = (await runTmux({
      args: [
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
      ],
    })).stdout.trim();
    await runTmux({
      args: ["set-option", "-w", "-t", paneId, "remain-on-exit", "on"],
    });
    await runTmux({
      args: ["pipe-pane", "-t", paneId, `cat >> ${shellQuote(capturePath)}`],
    });

    const command = `exec ${args.map(shellQuote).join(" ")}`;
    await runTmux({
      args: ["respawn-pane", "-k", "-t", paneId, "-c", root, command],
    });
    started = true;

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

      const dead = (await runTmux({
        args: ["display-message", "-p", "-t", paneId, "#{pane_dead}"],
      })).stdout.trim();
      if (dead === "1" || idlePolls >= 5) {
        break;
      }
    }

    await runTmux({
      args: ["pipe-pane", "-t", paneId],
      allowFailure: true,
    });
    const output = readFileSync(capturePath);
    if (output.length > 0) {
      process.stdout.write(output);
    }

    const dead = (await runTmux({
      args: ["display-message", "-p", "-t", paneId, "#{pane_dead}"],
    })).stdout.trim();
    if (dead === "1") {
      const status = Number((await runTmux({
        args: ["display-message", "-p", "-t", paneId, "#{pane_dead_status}"],
      })).stdout.trim());
      console.error(`ho-bj: ${slug} exited with status ${status}`);
      process.exitCode = status;
      return;
    }

    console.error(`ho-bj: ${slug} is running; attach with: tmux attach -t ho-bj`);
  } finally {
    await cleanup();
  }
}

function fail({ message, status = 1 }) {
  console.error(message);
  process.exit(status);
}

async function runTmux({ args, allowFailure = false }) {
  try {
    const result = await execFile("tmux", args, { encoding: "utf8" });
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
