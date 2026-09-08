#!/usr/bin/env node
// Read Codex hook JSON from stdin and show a native desktop notification.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { basename } from "node:path";

function isWSL() {
  try {
    return /microsoft/i.test(readFileSync("/proc/version", "utf8"));
  } catch {
    return false;
  }
}

// Notification failures must not interfere with the agent's turn or approval.
function run(command, args, input) {
  spawnSync(command, args, { input, stdio: ["pipe", "ignore", "ignore"], timeout: 4000 });
}

function main() {
  let event;
  try {
    event = JSON.parse(readFileSync(0, "utf8")) ?? {};
  } catch {
    event = {};
  }

  const project = typeof event.cwd === "string" ? basename(event.cwd) : "";
  const title = project ? `Codex [${project}]` : "Codex";
  const text = event.hook_event_name === "PermissionRequest"
    ? "Approval requested"
    : event.last_assistant_message || event.message || "Codex finished";
  const characters = Array.from(String(text));
  const message = characters.length > 240
    ? characters.slice(0, 237).join("") + "..."
    : characters.join("");

  if (process.platform === "win32" || (process.platform === "linux" && isWSL())) {
    const payload = Buffer.from(JSON.stringify({ title, message }), "utf8").toString("base64");
    run("powershell.exe", ["-NoProfile", "-Command", `
      $data = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${payload}')) | ConvertFrom-Json
      $text1 = New-BTText -Content $data.title
      $text2 = New-BTText -Content $data.message
      $binding = New-BTBinding -Children $text1, $text2
      $visual = New-BTVisual -BindingGeneric $binding
      $content = New-BTContent -Visual $visual -ActivationType Protocol
      Submit-BTNotification -Content $content
    `]);
  } else if (process.platform === "darwin") {
    run("osascript", ["-", title, message], `
      on run argv
        display notification (item 2 of argv) with title (item 1 of argv)
      end run
    `);
  } else if (process.platform === "linux") {
    run("notify-send", ["-h", "string:sound-name:message-new-instant", "--", title, message]);
  }
}

main();
