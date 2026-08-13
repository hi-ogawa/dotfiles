#!/usr/bin/env node

import { execFile } from "node:child_process";
import { basename } from "node:path";
import { promisify } from "node:util";

const USAGE = `\
usage:
  wtmux                create and enter a new session view
  wtmux list [--all]   list workspace panes
  wtmux prune [--all]  remove stale sessions

options:
  --all                 target all workspaces
  -h, --help            show this help

Linked Git worktrees share one workspace and its windows. Each invocation
creates an independent session view. Outside Git, the current directory
identifies the workspace.
`.trimEnd();

const execFileAsync = promisify(execFile);

async function main() {
  const parsed = parseCli();
  switch (parsed.action) {
    case "open":
      return openWorkspace();
    case "list":
      return listWorkspaces(parsed);
    case "prune":
      return pruneWorkspaces(parsed);
    case "help":
      console.log(USAGE);
      return;
    case "usage":
      console.log(USAGE);
      process.exitCode = 1;
  }
}

function parseCli() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    return { action: "open" };
  }
  if (args.length === 1 && ["-h", "--help"].includes(args[0])) {
    return { action: "help" };
  }
  if (
    ["list", "prune"].includes(args[0]) &&
    (args.length === 1 || (args.length === 2 && args[1] === "--all"))
  ) {
    return { action: args[0], all: args[1] === "--all" };
  }
  return { action: "usage" };
}

async function openWorkspace() {
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

async function listWorkspaces(options) {
  const sessions = await listSessions();
  const workspaceDirectory = options.all ? undefined : await resolveWorkspaceDirectory();
  const workspaceSessions = groupWorkspaceSessions(sessions, workspaceDirectory);

  if (workspaceSessions.size === 0) {
    console.error(
      options.all ? "wtmux: no workspaces" : `wtmux: no workspace: ${workspaceDirectory}`,
    );
    return;
  }

  const sections = [];
  const sortedWorkspaces = [...workspaceSessions].sort(([left], [right]) =>
    left.localeCompare(right),
  );
  for (const [workspace, views] of sortedWorkspaces) {
    const panes = await listPanes(views[0].id);
    const windows = new Set(panes.map((pane) => pane.windowId)).size;
    const clients = views.reduce((count, view) => count + view.attachedClients, 0);
    const unattachedSessions = views.filter((view) => view.attachedClients === 0).length;
    const staleSessions = clients > 0 ? unattachedSessions : Math.max(0, unattachedSessions - 1);
    const summary = [
      formatCount(windows, "window"),
      formatCount(clients, "client"),
      formatCount(staleSessions, "stale session"),
    ];
    const rows = panes.map((pane) => [
      pane.windowIndex,
      pane.index,
      pane.windowName,
      pane.dead ? `exited(${pane.deadStatus})` : "running",
      pane.command,
      pane.title,
      // TODO: cwd is same most of the cases so can remove?
      pane.cwd,
      // TODO: job command
      pane.jobSlug || "-",
    ]);
    sections.push(
      [
        `== WORKSPACE - ${workspace} ==`,
        `status: ${summary.join(", ")}`,
        "",
        formatTable(["WIN", "PANE", "NAME", "STATE", "COMMAND", "TITLE", "CWD", "JOB"], rows),
      ].join("\n"),
    );
  }
  console.log(sections.join("\n\n"));
}

async function pruneWorkspaces(options) {
  const sessions = await listSessions();
  const workspaceDirectory = options.all ? undefined : await resolveWorkspaceDirectory();
  const workspaceSessions = groupWorkspaceSessions(sessions, workspaceDirectory);

  if (workspaceSessions.size === 0) {
    console.error(
      options.all ? "wtmux: no workspaces" : `wtmux: no workspace: ${workspaceDirectory}`,
    );
    return;
  }

  let pruned = 0;
  for (const sessions of workspaceSessions.values()) {
    const detached = sessions.filter((session) => session.attachedClients === 0);
    const hasClients = sessions.some((session) => session.attachedClients > 0);
    // Keep one anchor because killing the final session also kills the shared windows.
    const stale = hasClients ? detached : detached.slice(1);
    for (const session of stale) {
      await runTmux(["kill-session", "-t", session.id]);
      pruned++;
    }
  }

  console.error(
    pruned === 0
      ? "wtmux: no stale sessions"
      : `wtmux: pruned ${pruned} stale session${pruned === 1 ? "" : "s"}`,
  );
}

function groupWorkspaceSessions(sessions, workspaceDirectory) {
  return Map.groupBy(
    sessions.filter(
      (session) =>
        session.workspaceDirectory &&
        (workspaceDirectory === undefined || session.workspaceDirectory === workspaceDirectory),
    ),
    (session) => session.workspaceDirectory,
  );
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
      "#{session_id}\t#{session_name}\t#{session_attached}\t#{@wtmux_workspace}",
    ]);
  } catch (error) {
    if (error.cause?.code === 1) {
      return [];
    }
    throw error;
  }
  return output ? output.split("\n").map(parseSession) : [];

  function parseSession(line) {
    const [id, name, attachedClients, workspaceDirectory] = line.split("\t");
    return { id, name, attachedClients: Number(attachedClients), workspaceDirectory };
  }
}

async function listPanes(sessionId) {
  const output = await runTmux([
    "list-panes",
    "-s",
    "-t",
    sessionId,
    "-F",
    "#{window_id}\t#{window_index}\t#{window_name}\t#{pane_index}\t#{pane_dead}\t#{pane_dead_status}\t#{pane_current_command}\t#{pane_title}\t#{pane_current_path}\t#{@wtmux_job_slug}",
  ]);
  return output ? output.split("\n").map(parsePane) : [];

  function parsePane(line) {
    const [
      windowId,
      windowIndex,
      windowName,
      index,
      dead,
      deadStatus,
      command,
      title,
      cwd,
      jobSlug,
    ] = line.split("\t");
    return {
      windowId,
      windowIndex,
      windowName,
      index,
      dead: dead === "1",
      deadStatus,
      command,
      title,
      cwd,
      jobSlug,
    };
  }
}

function chooseUniqueSessionName(cwd, existingNames) {
  const name = basename(cwd)
    .replaceAll(/[^A-Za-z0-9_-]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
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

function formatTable(headers, rows) {
  const widths = headers.map((header, index) =>
    Math.max(header.length, ...rows.map((row) => String(row[index]).length)),
  );
  return [headers, ...rows]
    .map((row) =>
      row
        .map((value, index) => {
          const text = String(value);
          return index === row.length - 1 ? text : text.padEnd(widths[index]);
        })
        .join("  "),
    )
    .join("\n");
}

function formatCount(count, noun) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
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
