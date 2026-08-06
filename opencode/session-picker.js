#!/usr/bin/env node

import { accessSync, constants, realpathSync } from "node:fs";
import { homedir } from "node:os";
import { basename, delimiter, join } from "node:path";
import process from "node:process";
import readline from "node:readline";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const RESET = "\u001b[0m";

function findExecutable(command) {
  for (const directory of (process.env.PATH ?? "").split(delimiter)) {
    const path = join(directory, command);
    try {
      accessSync(path, constants.X_OK);
      return path;
    } catch {}
  }
  throw new Error(`Missing required command: ${command}`);
}

function shellQuote(value) {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}

function previewSession(sessionId) {
  if (!/^ses_[a-zA-Z0-9]+$/.test(sessionId)) {
    throw new Error("Invalid session ID");
  }

  const dataHome = process.env.XDG_DATA_HOME ?? join(homedir(), ".local", "share");
  const database = new DatabaseSync(join(dataHome, "opencode", "opencode.db"), {
    readOnly: true,
  });

  try {
    // Keep the preview conversational by excluding tool calls and reasoning parts.
    const messages = database
      .prepare(`
        SELECT
          json_extract(message.data, '$.role') AS role,
          json_extract(part.data, '$.text') AS text
        FROM part
        JOIN message ON message.id = part.message_id
        WHERE part.session_id = ?
          AND json_extract(part.data, '$.type') = 'text'
          AND json_extract(message.data, '$.role') IN ('user', 'assistant')
          AND trim(json_extract(part.data, '$.text')) != ''
        ORDER BY part.time_created DESC
        LIMIT 12
      `)
      .all(sessionId)
      .reverse();

    for (const { role, text } of messages) {
      const user = role === "user";
      const heading = user ? "\u001b[1;33mUSER" : "\u001b[1;36mASSISTANT";
      const body = user ? "\u001b[38;5;223m" : "\u001b[38;5;153m";
      process.stdout.write(`\n${heading}${RESET}\n${body}${text}${RESET}\n`);
    }
  } finally {
    database.close();
  }
}

function cleanField(value) {
  return String(value ?? "").replace(/[\t\r\n]/g, " ");
}

function formatUpdated(updated) {
  const date = new Date(updated);
  const parts = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
  ];
  return `${parts[0]}-${parts[1]}-${parts[2]} ${parts[3]}:${parts[4]}`;
}

function listSessions(opencode) {
  const result = spawnSync(opencode, ["session", "list", "--format", "json", "-n", "100"], {
    encoding: "utf8",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || "Failed to list OpenCode sessions");
  }

  return JSON.parse(result.stdout).map((session) =>
    [
      cleanField(session.id),
      formatUpdated(session.updated),
      cleanField(session.title),
      cleanField(basename(session.directory)),
    ].join("\t"),
  );
}

function chooseSession(fzf, sessions) {
  const script = realpathSync(fileURLToPath(import.meta.url));
  const preview = `${shellQuote(process.execPath)} ${shellQuote(script)} --preview {1}`;
  const result = spawnSync(
    fzf,
    [
      "--ansi",
      "--delimiter=\t",
      "--with-nth=2..",
      "--layout=reverse",
      "--header=enter: select | esc: cancel",
      "--prompt=Sessions> ",
      `--preview=${preview}`,
      "--preview-window=right:60%:wrap",
    ],
    { input: `${sessions.join("\n")}\n`, encoding: "utf8", stdio: ["pipe", "pipe", "inherit"] },
  );
  if (result.error) throw result.error;
  return result.status === 0 ? result.stdout.trimEnd() : "";
}

async function chooseAction() {
  readline.emitKeypressEvents(process.stdin);
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
    throw new Error("Session action requires an interactive terminal");
  }

  process.stdout.write("\nenter: continue | f: fork | esc: cancel ");
  process.stdin.setRawMode(true);
  process.stdin.resume();

  try {
    while (true) {
      const key = await new Promise((resolve) => process.stdin.once("keypress", (_, value) => resolve(value)));
      if (key.name === "return") return "continue";
      if (key.name === "f") return "fork";
      if (key.name === "escape" || (key.ctrl && key.name === "c")) return "cancel";
    }
  } finally {
    process.stdin.setRawMode(false);
    process.stdin.pause();
    process.stdout.write("\n");
  }
}

async function main() {
  if (process.argv[2] === "--preview") {
    previewSession(process.argv[3] ?? "");
    return;
  }

  if (typeof process.execve !== "function") {
    throw new Error("Node.js 22.15 or newer is required");
  }

  const opencode = findExecutable("opencode");
  const fzf = findExecutable("fzf");
  const sessions = listSessions(opencode);
  if (sessions.length === 0) {
    throw new Error("No OpenCode sessions found for this project.");
  }

  const selection = chooseSession(fzf, sessions);
  if (!selection) return;

  const action = await chooseAction();
  if (action === "cancel") return;

  const sessionId = selection.split("\t", 1)[0];
  const args = ["opencode", "--session", sessionId];
  if (action === "fork") args.push("--fork");

  // Replace the wrapper process so the selected OpenCode TUI owns the terminal directly.
  process.execve(opencode, args, process.env);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
