#!/usr/bin/env node

import { execFile } from "node:child_process";
import { basename } from "node:path";
import { promisify } from "node:util";

const usage = `\
usage: wtmux

Open the tmux workspace for the current Git checkout or directory.

Every invocation creates its own tmux session view. Views for the main checkout
and linked worktrees share windows while retaining independent current-window
selection.
Outside Git, the current directory is treated as a standalone workspace.

wtmux attaches when run outside tmux and switches clients when run inside tmux.

options:
  -h, --help  show this help`;
const execFileAsync = promisify(execFile);

async function main() {
  if (process.argv.length > 2) {
    if (process.argv.length === 3 && ["-h", "--help"].includes(process.argv[2])) {
      console.log(usage);
      return;
    }
    console.log(usage);
    process.exitCode = 1;
    return;
  }

  // Git checkouts share an identity through their common Git directory. Outside
  // Git, the current directory identifies the workspace.
  const workspaceDirectory = await resolveWorkspaceDirectory();
  const cwd = process.cwd();
  const sessions = await listSessions();
  const workspaceSessions = sessions.filter(
    (session) => session.workspaceDirectory === workspaceDirectory,
  );
  const sessionName = chooseUniqueSessionName(
    cwd,
    sessions.map((candidate) => candidate.name),
  );

  let sessionId;
  if (workspaceSessions.length === 0) {
    // The first view creates both the workspace and its initial window at cwd.
    sessionId = await runTmux([
      "new-session",
      "-d",
      "-P",
      "-F",
      "#{session_id}",
      "-s",
      sessionName,
      "-n",
      basename(cwd),
      "-c",
      cwd,
    ]);
  } else {
    // Every invocation adds a grouped session, which shares windows while
    // retaining independent current-window selection.
    const source = workspaceSessions[0];
    sessionId = await runTmux([
      "new-session",
      "-d",
      "-P",
      "-F",
      "#{session_id}",
      "-s",
      sessionName,
      "-t",
      source.name,
    ]);
  }
  await runTmux(["set-option", "-t", sessionId, "@wtmux_workspace", workspaceDirectory]);

  // Replace wtmux with tmux so no wrapper process remains while attached.
  const args = process.env.TMUX
    ? ["switch-client", "-t", sessionId]
    : ["attach-session", "-t", sessionId];
  process.execve("/usr/bin/env", ["env", "tmux", ...args]);
}

async function resolveWorkspaceDirectory() {
  let stdout;
  try {
    ({ stdout } = await execFileAsync(
      "git",
      ["rev-parse", "--path-format=absolute", "--git-common-dir"],
      { encoding: "utf8" },
    ));
  } catch {
    return process.cwd();
  }
  return stdout.trim();
}

async function listSessions() {
  let output;
  try {
    output = await runTmux([
      "list-sessions",
      "-F",
      "#{session_id}\t#{session_name}\t#{@wtmux_workspace}",
    ]);
  } catch (error) {
    if (error.cause?.code === 1) {
      return [];
    }
    throw error;
  }
  return output ? output.split("\n").map(parseSession) : [];
}

function parseSession(line) {
  const [id, name, workspaceDirectory] = line.split("\t");
  return { id, name, workspaceDirectory };
}

function chooseUniqueSessionName(cwd, existingNames) {
  const name = basename(cwd).replaceAll(/[^A-Za-z0-9_-]+/g, "-").replaceAll(/^-+|-+$/g, "");
  const base = `wtmux-${name || "workspace"}`;
  if (!existingNames.includes(base)) {
    return base;
  }
  let suffix = 2;
  while (existingNames.includes(`${base}-${suffix}`)) {
    suffix++;
  }
  return `${base}-${suffix}`;
}

async function runTmux(args) {
  try {
    const { stdout } = await execFileAsync("tmux", args, { encoding: "utf8" });
    return stdout.trim();
  } catch (error) {
    throw new Error((error.stderr ?? "").trim() || error.message, { cause: error });
  }
}

main().catch((error) => {
  console.error(`wtmux: ${error.message}`);
  process.exitCode = 1;
});
