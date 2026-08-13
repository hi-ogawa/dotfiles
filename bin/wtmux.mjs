#!/usr/bin/env node

import { execFile } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { parseArgs, promisify } from "node:util";

const USAGE = `\
usage:
  wtmux                create and enter a new session view
  wtmux list [--all]   list workspace panes
  wtmux prune [--all]  remove stale sessions
  wtmux run --name <name> [-C <root>] [--detached]
            [--wait-timeout <seconds> | --no-wait] -- <command> [args...]
  wtmux stop --name <name>
  wtmux logs --name <name> [--lines <count>]

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
    case "run":
      return runCommand(parsed);
    case "stop":
      return stopCommand(parsed);
    case "logs":
      return showLogs(parsed);
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
  if (args[0] === "run") {
    return parseRunArguments(args.slice(1));
  }
  if (args[0] === "stop") {
    return parseStopArguments(args.slice(1));
  }
  if (args[0] === "logs") {
    return parseLogsArguments(args.slice(1));
  }
  return { action: "usage" };
}

function parseRunArguments(args) {
  const separator = args.indexOf("--");
  if (separator === -1) {
    fail(USAGE, { status: 2 });
  }
  const commandArgs = args.slice(separator + 1);
  let parsed;
  try {
    parsed = parseArgs({
      args: args.slice(0, separator),
      options: {
        name: { type: "string" },
        root: { type: "string", short: "C" },
        detached: { type: "boolean" },
        "no-wait": { type: "boolean" },
        "wait-timeout": { type: "string" },
      },
    });
  } catch {
    fail(USAGE, { status: 2 });
  }

  const name = validateName(parsed.values.name);
  const detached = parsed.values.detached ?? false;
  const noWait = parsed.values["no-wait"] ?? false;
  const waitTimeout = parsed.values["wait-timeout"];
  if (
    commandArgs.length === 0 ||
    (!detached && (noWait || waitTimeout !== undefined)) ||
    (noWait && waitTimeout !== undefined)
  ) {
    fail(USAGE, { status: 2 });
  }
  const waitTimeoutSeconds = Number(waitTimeout ?? 5);
  if (!Number.isFinite(waitTimeoutSeconds) || waitTimeoutSeconds <= 0) {
    fail(`invalid wait timeout: ${waitTimeout}`, { status: 2 });
  }

  const requestedRoot = parsed.values.root ?? process.cwd();
  const root = resolve(requestedRoot);
  if (!statSync(root, { throwIfNoEntry: false })?.isDirectory()) {
    fail(`root not found: ${requestedRoot}`);
  }
  return {
    action: "run",
    name,
    root,
    commandArgs,
    detached,
    noWait,
    waitTimeoutMs: waitTimeoutSeconds * 1000,
  };
}

function parseStopArguments(args) {
  let parsed;
  try {
    parsed = parseArgs({ args, options: { name: { type: "string" } } });
  } catch {
    fail(USAGE, { status: 2 });
  }
  return { action: "stop", name: validateName(parsed.values.name) };
}

function parseLogsArguments(args) {
  let parsed;
  try {
    parsed = parseArgs({
      args,
      options: {
        name: { type: "string" },
        lines: { type: "string" },
      },
    });
  } catch {
    fail(USAGE, { status: 2 });
  }
  const lines = Number(parsed.values.lines ?? 200);
  if (!Number.isSafeInteger(lines) || lines <= 0) {
    fail(`invalid line count: ${parsed.values.lines}`, { status: 2 });
  }
  return { action: "logs", name: validateName(parsed.values.name), lines };
}

function validateName(name) {
  if (!name || /[\t\r\n]/.test(name)) {
    fail(`invalid window name: ${name ?? ""}`, { status: 2 });
  }
  return name;
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

async function runCommand(options) {
  const workspaceDirectory = await resolveWorkspaceDirectory();
  const sessions = await listSessions();
  const workspaceSessions = sessions.filter(
    (session) => session.workspaceDirectory === workspaceDirectory,
  );
  if (workspaceSessions.length > 0) {
    const duplicate = (await listWindows(workspaceSessions[0].id)).some(
      (window) => window.name === options.name,
    );
    if (duplicate) {
      fail(`window already exists: ${options.name}`);
    }
  }

  let temporaryDirectory;
  let capturePath;
  if (options.detached && !options.noWait) {
    temporaryDirectory = mkdtempSync(join(tmpdir(), "wtmux."));
    capturePath = join(temporaryDirectory, "startup.log");
    writeFileSync(capturePath, "");
  }

  let paneId;
  let sessionId;
  let createdWorkspace = false;
  let started = false;
  let cleanedUp = false;

  async function cleanup() {
    if (cleanedUp) {
      return;
    }
    cleanedUp = true;
    if (paneId) {
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
    if (workspaceSessions.length === 0) {
      const sessionName = chooseUniqueSessionName(
        process.cwd(),
        sessions.map((session) => session.name),
      );
      const result = await runTmux([
        "new-session",
        "-d",
        "-P",
        "-F",
        "#{session_id}\t#{pane_id}",
        "-s",
        sessionName,
        "-n",
        options.name,
        "-c",
        options.root,
      ]);
      [sessionId, paneId] = result.split("\t");
      createdWorkspace = true;
      await runTmux(["set-option", "-t", sessionId, "@wtmux_workspace", workspaceDirectory]);
    } else {
      sessionId = workspaceSessions[0].id;
      paneId = await runTmux([
        "new-window",
        "-d",
        "-P",
        "-F",
        "#{pane_id}",
        "-t",
        `${sessionId}:`,
        "-n",
        options.name,
        "-c",
        options.root,
      ]);
    }

    await runTmux(["set-option", "-w", "-t", paneId, "automatic-rename", "off"]);
    await runTmux(["set-option", "-w", "-t", paneId, "remain-on-exit", "on"]);
    await runTmux(["set-option", "-w", "-t", paneId, "@wtmux_root", options.root]);
    await runTmux([
      "set-option",
      "-w",
      "-t",
      paneId,
      "@wtmux_command",
      options.commandArgs.map(shellQuote).join(" "),
    ]);
    await runTmux([
      "set-option",
      "-w",
      "-t",
      paneId,
      "@wtmux_started_at",
      String(Date.now()),
    ]);
    if (capturePath) {
      await runTmux(["pipe-pane", "-t", paneId, `cat >> ${shellQuote(capturePath)}`]);
    }

    const command = `exec ${options.commandArgs.map(shellQuote).join(" ")}`;
    await runTmux(["respawn-pane", "-k", "-t", paneId, "-c", options.root, command]);
    started = true;

    if (!options.detached) {
      return enterStartedWindow({
        workspaceDirectory,
        sourceSessionId: sessionId,
        paneId,
        createdWorkspace,
        sessions,
      });
    }
    if (options.noWait) {
      console.error(`wtmux: ${options.name} started`);
      return;
    }

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
      { intervalMs: 100, timeoutMs: options.waitTimeoutMs, idlePollLimit: 10 },
    );

    // tmux closes the pipe automatically when the pane exits.
    await runTmux(["pipe-pane", "-t", paneId]).catch(() => {});
    const output = readFileSync(capturePath);
    if (output.length > 0) {
      process.stdout.write("--- wtmux: startup output ---\n");
      process.stdout.write(output);
      if (output.at(-1) !== 0x0a) {
        process.stdout.write("\n");
      }
      process.stdout.write("--- wtmux: end startup output ---\n");
    }

    const dead = await runTmux(["display-message", "-p", "-t", paneId, "#{pane_dead}"]);
    if (dead === "1") {
      const status = await runTmux([
        "display-message",
        "-p",
        "-t",
        paneId,
        "#{pane_dead_status}",
      ]);
      console.error(`wtmux: ${options.name} exited with status ${status}`);
      process.exitCode = Number(status);
      return;
    }
    console.error(`wtmux: ${options.name} is running`);
  }

  try {
    await start();
  } finally {
    await cleanup();
  }
}

async function enterStartedWindow(options) {
  const windowIndex = await runTmux([
    "display-message",
    "-p",
    "-t",
    options.paneId,
    "#{window_index}",
  ]);
  let targetSessionId = options.sourceSessionId;

  if (!options.createdWorkspace && process.env.TMUX_PANE) {
    const current = await runTmux([
      "display-message",
      "-p",
      "-t",
      process.env.TMUX_PANE,
      "#{session_id}\t#{@wtmux_workspace}",
    ]);
    const [currentSessionId, currentWorkspace] = current.split("\t");
    if (currentWorkspace === options.workspaceDirectory) {
      await runTmux(["select-window", "-t", `${currentSessionId}:${windowIndex}`]);
      return;
    }
  }

  if (!options.createdWorkspace) {
    const sessionName = chooseUniqueSessionName(
      process.cwd(),
      options.sessions.map((session) => session.name),
    );
    targetSessionId = await runTmux([
      "new-session",
      "-d",
      "-P",
      "-F",
      "#{session_id}",
      "-s",
      sessionName,
      "-t",
      options.sourceSessionId,
    ]);
    await runTmux([
      "set-option",
      "-t",
      targetSessionId,
      "@wtmux_workspace",
      options.workspaceDirectory,
    ]);
  }

  await runTmux(["select-window", "-t", `${targetSessionId}:${windowIndex}`]);
  const args = process.env.TMUX
    ? ["switch-client", "-t", targetSessionId]
    : ["attach-session", "-t", targetSessionId];
  process.execve("/usr/bin/env", ["env", "tmux", ...args]);
}

async function stopCommand(options) {
  const window = await resolveNamedWindow(options.name);
  await runTmux(["kill-window", "-t", window.id]);
  console.error(`wtmux: ${options.name} stopped`);
}

async function showLogs(options) {
  const window = await resolveNamedWindow(options.name);
  const paneIds = await listPaneIds(window.id);
  if (paneIds.length !== 1) {
    fail(`window has multiple panes: ${options.name}`);
  }
  const output = await runTmux([
    "capture-pane",
    "-p",
    "-S",
    `-${options.lines}`,
    "-t",
    paneIds[0],
  ]);
  if (output) {
    console.log(output);
  } else {
    console.error(`wtmux: ${options.name} has no output`);
  }
}

async function resolveNamedWindow(name) {
  const workspaceDirectory = await resolveWorkspaceDirectory();
  const sessions = await listSessions();
  const workspaceSession = sessions.find(
    (session) => session.workspaceDirectory === workspaceDirectory,
  );
  if (!workspaceSession) {
    fail(`window not found: ${name}`);
  }
  const matches = (await listWindows(workspaceSession.id)).filter((window) => window.name === name);
  if (matches.length === 0) {
    fail(`window not found: ${name}`);
  }
  if (matches.length > 1) {
    fail(`ambiguous window name: ${name}`);
  }
  return matches[0];
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
    ]);
    sections.push(
      [
        `== WORKSPACE - ${workspace} ==`,
        `status: ${summary.join(", ")}`,
        "",
        formatTable(["WIN", "PANE", "NAME", "STATE", "COMMAND", "TITLE", "CWD"], rows),
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
    "#{window_id}\t#{window_index}\t#{window_name}\t#{pane_index}\t#{pane_dead}\t#{pane_dead_status}\t#{pane_current_command}\t#{pane_title}\t#{pane_current_path}",
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
    };
  }
}

async function listWindows(sessionId) {
  const output = await runTmux([
    "list-windows",
    "-t",
    sessionId,
    "-F",
    "#{window_id}\t#{window_index}\t#{window_name}",
  ]);
  return output ? output.split("\n").map(parseWindow) : [];

  function parseWindow(line) {
    const [id, index, name] = line.split("\t");
    return { id, index, name };
  }
}

async function listPaneIds(windowId) {
  const output = await runTmux(["list-panes", "-t", windowId, "-F", "#{pane_id}"]);
  return output ? output.split("\n") : [];
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

async function pollUntil(sample, options) {
  const deadline = Date.now() + options.timeoutMs;
  let previousValue;
  let hasValue = false;
  let idlePolls = 0;
  while (true) {
    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) {
      return;
    }
    await sleep(Math.min(options.intervalMs, remainingMs));
    const result = await sample();
    if (result.state === "done") {
      return;
    }
    if (result.state === "pending") {
      continue;
    }
    if (hasValue && Object.is(result.value, previousValue)) {
      if (++idlePolls >= options.idlePollLimit) {
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
  return new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));
}

function fail(message, options = {}) {
  console.error(message);
  process.exit(options.status ?? 1);
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
