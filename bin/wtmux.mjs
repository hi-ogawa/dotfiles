#!/usr/bin/env node

import { execFile, spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { parseArgs, promisify } from "node:util";

const HELP = `\
# wtmux

Share tmux windows across a Git repository and its linked worktrees.

## Open a Workspace

~~~sh
wtmux
~~~

Create and enter a new session view. Every view shares the workspace windows while retaining independent window selection.

~~~sh
cd ~/code/project
wtmux
~~~

## Run a Command

~~~sh
wtmux run --name <name> [-C <root>] [--wait-timeout <seconds> | --no-wait] -- <command> [args...]
~~~

Run a command in a named shared window without changing the current client. By default, wtmux captures startup output and waits until output becomes quiet, the command exits, or five seconds pass.

~~~sh
wtmux run --name dev -- pnpm dev
~~~

Return immediately when startup observation is unnecessary:

~~~sh
wtmux run --name tests --no-wait -- pnpm test --watch
~~~

Run from another directory:

~~~sh
wtmux run --name docs -C ./docs -- pnpm dev
~~~

## Inspect a Workspace

~~~sh
wtmux list [--all]
~~~

Show windows, panes, clients, and stale sessions for the current workspace. RUN is the stable name assigned by wtmux run; ordinary windows show -. Use --all to inspect every wtmux workspace.

~~~sh
wtmux list
wtmux list --all
~~~

## Interactive UI

~~~sh
wtmux ui [--all]
~~~

Choose a window from the current workspace with fzf, most recently active first, with a live preview of its screen. Enter opens a new session view focused on that window. Ctrl-N opens a new session view on a new window at the current directory. Ctrl-X stops the highlighted window, and Ctrl-R refreshes the list. Requires fzf.

Use --all to choose from every wtmux workspace. There, Ctrl-N opens the new window in the home workspace, a conventional starting directory at $WTMUX_HOME, which defaults to ~/.local/state/wtmux/home.

## Read Command Output

~~~sh
wtmux logs --name <name> [--lines <count>]
~~~

Read recent tmux history from a named single-pane window. The default is 200 lines.

~~~sh
wtmux logs --name dev
wtmux logs --name dev --lines 50
~~~

## Stop a Command

~~~sh
wtmux stop --name <name>
~~~

Remove the named window and stop the processes running inside it.

~~~sh
wtmux stop --name dev
~~~

## Prune Stale Sessions

~~~sh
wtmux prune [--all]
~~~

Remove redundant detached session views. Preserve one anchor session when a workspace has no clients so its windows and processes remain alive.

~~~sh
wtmux prune
wtmux prune --all
~~~

Inside Git, the common Git directory identifies the workspace. Outside Git, the current directory identifies it.
`.replaceAll("~~~", "```").trimEnd();

const execFileAsync = promisify(execFile);

async function main() {
  const parsed = parseCli();
  switch (parsed.action) {
    case "open":
      return handleOpenCommand();
    case "list":
      return handleListCommand(parsed);
    case "ui":
      return handleUiCommand(parsed);
    case "ui-rows":
      return console.log((await listUiRows(parsed)).join("\n"));
    case "prune":
      return handlePruneCommand(parsed);
    case "run":
      return handleRunCommand(parsed);
    case "stop":
      return handleStopCommand(parsed);
    case "logs":
      return handleLogsCommand(parsed);
    case "help":
      console.log(HELP);
      return;
    case "usage":
      console.log(HELP);
      process.exitCode = 2;
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
  if (args[0] === "ui" && (args.length === 1 || (args.length === 2 && args[1] === "--all"))) {
    return { action: "ui", all: args[1] === "--all" };
  }
  // fzf reinvokes wtmux in this internal mode to reload the UI rows.
  if (
    args[0] === "ui" &&
    args[1] === "--internal-rows" &&
    (args.length === 2 || (args.length === 3 && args[2] === "--all"))
  ) {
    return { action: "ui-rows", all: args[2] === "--all" };
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
    return { action: "usage" };
  }
  const commandArgs = args.slice(separator + 1);
  let parsed;
  try {
    parsed = parseArgs({
      args: args.slice(0, separator),
      options: {
        name: { type: "string" },
        root: { type: "string", short: "C" },
        "no-wait": { type: "boolean" },
        "wait-timeout": { type: "string" },
      },
    });
  } catch {
    return { action: "usage" };
  }

  const name = validateName(parsed.values.name);
  const noWait = parsed.values["no-wait"] ?? false;
  const waitTimeout = parsed.values["wait-timeout"];
  if (commandArgs.length === 0 || (noWait && waitTimeout !== undefined)) {
    return { action: "usage" };
  }
  // TODO: Bound the converted milliseconds so a finite seconds value cannot overflow.
  const waitTimeoutSeconds = Number(waitTimeout ?? 5);
  if (!Number.isFinite(waitTimeoutSeconds) || waitTimeoutSeconds <= 0) {
    throw new Error(`invalid wait timeout: ${waitTimeout}`);
  }

  const requestedRoot = parsed.values.root ?? process.cwd();
  const root = resolve(requestedRoot);
  if (!statSync(root, { throwIfNoEntry: false })?.isDirectory()) {
    throw new Error(`root not found: ${requestedRoot}`);
  }
  return {
    action: "run",
    name,
    root,
    commandArgs,
    noWait,
    waitTimeoutMs: waitTimeoutSeconds * 1000,
  };
}

function parseStopArguments(args) {
  let parsed;
  try {
    parsed = parseArgs({ args, options: { name: { type: "string" } } });
  } catch {
    return { action: "usage" };
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
    return { action: "usage" };
  }
  const lines = Number(parsed.values.lines ?? 200);
  if (!Number.isSafeInteger(lines) || lines <= 0) {
    throw new Error(`invalid line count: ${parsed.values.lines}`);
  }
  return { action: "logs", name: validateName(parsed.values.name), lines };
}

function validateName(name) {
  if (!name || name !== name.trim() || /[\t\r\n]/.test(name)) {
    throw new Error(`invalid window name: ${name ?? ""}`);
  }
  return name;
}

async function handleOpenCommand() {
  // Git checkouts share an identity through their common Git directory. Outside
  // Git, the current directory identifies the workspace.
  const workspaceDirectory = await resolveWorkspaceDirectory();
  const sessionId = await createView(workspaceDirectory, process.cwd());
  enterView(sessionId);
}

async function createView(workspaceDirectory, cwd) {
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
  return sessionId;
}

function enterView(sessionId) {
  // Replace wtmux with tmux so no wrapper process remains while attached.
  const args = process.env.TMUX
    ? ["switch-client", "-t", sessionId]
    : ["attach-session", "-t", sessionId];
  process.execve("/usr/bin/env", ["env", "tmux", ...args]);
}

async function handleRunCommand(options) {
  // TODO: Lock workspace discovery through window creation to prevent split groups and duplicate names.
  const workspaceDirectory = await resolveWorkspaceDirectory();
  const sessions = await listSessions();
  const workspaceSessions = sessions.filter(
    (session) => session.workspaceDirectory === workspaceDirectory,
  );
  if (workspaceSessions.length > 0) {
    const duplicate = (await listWindows(workspaceSessions[0].id)).some(
      (window) => window.runName === options.name,
    );
    if (duplicate) {
      throw new Error(`run already exists: ${options.name}`);
    }
  }

  let temporaryDirectory;
  let capturePath;
  if (!options.noWait) {
    temporaryDirectory = mkdtempSync(join(tmpdir(), "wtmux."));
    capturePath = join(temporaryDirectory, "startup.log");
    writeFileSync(capturePath, "");
  }

  let paneId;
  let sessionId;
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
    await runTmux(["set-option", "-w", "-t", paneId, "@wtmux_run_name", options.name]);
    if (capturePath) {
      await runTmux(["pipe-pane", "-t", paneId, `cat >> ${shellQuote(capturePath)}`]);
    }

    const command = `exec ${options.commandArgs.map(shellQuote).join(" ")}`;
    await runTmux(["respawn-pane", "-k", "-t", paneId, "-c", options.root, command]);
    started = true;

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
      // TODO: Include pane_dead_signal so signal termination cannot be reported as success.
      const status = await runTmux(["display-message", "-p", "-t", paneId, "#{pane_dead_status}"]);
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

async function handleStopCommand(options) {
  const window = await resolveNamedWindow(options.name);
  await runTmux(["kill-window", "-t", window.id]);
  console.error(`wtmux: ${options.name} stopped`);
}

async function handleLogsCommand(options) {
  const window = await resolveNamedWindow(options.name);
  const panes = await listPanes(window.id);
  if (panes.length !== 1) {
    throw new Error(`window has multiple panes: ${options.name}`);
  }
  const output = await runTmux([
    "capture-pane",
    "-p",
    "-S",
    `-${options.lines}`,
    "-t",
    panes[0].id,
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
    throw new Error(`run not found: ${name}`);
  }
  const matches = (await listWindows(workspaceSession.id)).filter(
    (window) => window.runName === name,
  );
  if (matches.length === 0) {
    throw new Error(`run not found: ${name}`);
  }
  if (matches.length > 1) {
    throw new Error(`ambiguous run name: ${name}`);
  }
  return matches[0];
}

async function handleListCommand(options) {
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
      pane.runName || "-",
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
        formatTable(["WIN", "PANE", "RUN", "STATE", "COMMAND", "TITLE", "CWD"], rows),
      ].join("\n"),
    );
  }
  console.log(sections.join("\n\n"));
}

async function handleUiCommand(options) {
  const workspaceDirectory = options.all ? undefined : await resolveWorkspaceDirectory();
  // The list may be empty, because Ctrl-N is still useful when nothing is running.
  const rows = await listUiRows(options, workspaceDirectory);

  // fzf owns the list, filtering, and live preview. The hidden leading TSV
  // fields carry the pane, window, and workspace through selection.
  const self = `${shellQuote(process.execPath)} ${shellQuote(process.argv[1])}`;
  const reload = `reload(${self} ui --internal-rows${options.all ? " --all" : ""})`;
  const header = [
    "enter: open window",
    `ctrl-n: new window${options.all ? " at home" : ""}`,
    "ctrl-x: stop window",
    "ctrl-r: refresh",
    "esc: cancel",
  ].join(" | ");
  let selection;
  try {
    selection = await runInteractive(
      "fzf",
      [
        "--ansi",
        "--exact",
        "--delimiter=\t",
        "--with-nth=5",
        "--header-lines=1",
        "--layout=reverse",
        `--header=${header}`,
        "--prompt=wtmux> ",
        // The first output line names the action, and the second carries the highlighted row.
        "--bind=enter:print(open)+accept",
        "--bind=ctrl-n:print(new)+accept",
        `--bind=ctrl-x:execute-silent(tmux kill-window -t {2})+${reload}`,
        `--bind=ctrl-r:${reload}`,
        "--preview=tmux capture-pane -p -e -t {1}",
        "--preview-window=down:70%",
      ],
      rows.join("\n"),
    );
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error("fzf not found");
    }
    throw error;
  }
  if (!selection) {
    return;
  }

  const [action, row = ""] = selection.split("\n");
  if (action === "new") {
    // Across every workspace there is no single target, so new windows go to the
    // conventional home workspace instead.
    let target = workspaceDirectory;
    let cwd = process.cwd();
    if (options.all) {
      target = cwd = resolveHomeDirectory();
      mkdirSync(cwd, { recursive: true });
    }
    const exists = (await listSessions()).some((session) => session.workspaceDirectory === target);
    const sessionId = await createView(target, cwd);
    // The first view of a new workspace already starts with a window at cwd.
    if (exists) {
      await runTmux(["new-window", "-t", `${sessionId}:`, "-c", cwd]);
    }
    enterView(sessionId);
  }
  if (!row) {
    return;
  }

  const [, , windowIndex, selectedWorkspace, , cwd] = row.split("\t");
  const sessionId = await createView(selectedWorkspace, cwd);
  // Grouped sessions share window indexes, so the index targets the same window.
  await runTmux(["select-window", "-t", `${sessionId}:${windowIndex}`]);
  enterView(sessionId);
}

async function listUiRows(options, workspaceDirectory) {
  workspaceDirectory ??= options.all ? undefined : await resolveWorkspaceDirectory();
  const panes = [];
  for (const [workspace, views] of groupWorkspaceSessions(
    await listSessions(),
    workspaceDirectory,
  )) {
    for (const pane of await listPanes(views[0].id)) {
      if (pane.active) {
        // Exited panes report no current path, so fall back to the workspace checkout.
        const cwd = pane.cwd || (basename(workspace) === ".git" ? dirname(workspace) : workspace);
        panes.push({ ...pane, workspace, cwd });
      }
    }
  }
  panes.sort((left, right) => right.windowActivity - left.windowActivity);

  const now = Date.now() / 1000;
  const display = formatTable(
    ["CHECKOUT", "WINDOW", "STATE", "IDLE", "COMMAND", "TITLE"],
    panes.map((pane) => [
      basename(pane.cwd),
      pane.runName || pane.windowName,
      pane.dead ? `exited(${pane.deadStatus})` : "running",
      formatDuration(now - pane.windowActivity),
      pane.command,
      pane.title.replaceAll(/[\t\r\n]/g, " "),
    ]),
  ).split("\n");
  return [
    ["", "", "", "", display[0], ""].join("\t"),
    ...panes.map((pane, index) =>
      [pane.id, pane.windowId, pane.windowIndex, pane.workspace, display[index + 1], pane.cwd].join(
        "\t",
      ),
    ),
  ];
}

async function handlePruneCommand(options) {
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

function resolveHomeDirectory() {
  if (process.env.WTMUX_HOME) {
    return resolve(process.env.WTMUX_HOME);
  }
  const stateHome = process.env.XDG_STATE_HOME || join(homedir(), ".local", "state");
  return join(stateHome, "wtmux", "home");
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

async function listPanes(targetId) {
  const args = ["list-panes"];
  if (targetId.startsWith("$")) {
    args.push("-s");
  }
  args.push(
    "-t",
    targetId,
    "-F",
    "#{pane_id}\t#{window_id}\t#{window_index}\t#{@wtmux_run_name}\t#{pane_index}\t#{pane_dead}\t#{pane_dead_status}\t#{pane_current_command}\t#{pane_title}\t#{pane_current_path}\t#{window_name}\t#{pane_active}\t#{window_activity}",
  );
  const output = await runTmux(args);
  return output ? output.split("\n").map(parsePane) : [];

  function parsePane(line) {
    const [
      id,
      windowId,
      windowIndex,
      runName,
      index,
      dead,
      deadStatus,
      command,
      title,
      cwd,
      windowName,
      active,
      windowActivity,
    ] = line.split("\t");
    return {
      id,
      windowId,
      windowIndex,
      runName,
      index,
      dead: dead === "1",
      deadStatus,
      command,
      title,
      cwd,
      windowName,
      active: active === "1",
      windowActivity: Number(windowActivity),
    };
  }
}

async function listWindows(sessionId) {
  const windows = new Map();
  for (const pane of await listPanes(sessionId)) {
    windows.set(pane.windowId, {
      id: pane.windowId,
      index: pane.windowIndex,
      runName: pane.runName,
    });
  }
  return [...windows.values()];
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

function formatDuration(seconds) {
  if (seconds < 60) {
    return `${Math.max(0, Math.floor(seconds))}s`;
  }
  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m`;
  }
  if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)}h`;
  }
  return `${Math.floor(seconds / 86400)}d`;
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

// Run a terminal UI that draws on the TTY while its selection is read from stdout.
function runInteractive(command, args, input) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, { stdio: ["pipe", "pipe", "inherit"] });
    let stdout = "";
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.on("error", rejectPromise);
    // fzf exits with 1 when nothing matches, but print() actions still produce
    // output then. Only 130 (cancel) and other failures mean no selection.
    child.on("close", (code) => resolvePromise(code === 0 || code === 1 ? stdout.trimEnd() : ""));
    child.stdin.end(input);
  });
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
