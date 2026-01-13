/**
 * OpenCode Notification Plugin
 *
 * Sends desktop notifications for events that need user attention.
 * Works on Linux (notify-send), macOS (osascript), and Windows (BurntToast)
 */

import { spawn } from "node:child_process";
import { platform } from "node:os";
import { basename, join } from "node:path";

const ICON_PATH = join(import.meta.dirname, "notify-icon.png");

const NOTIFY_EVENTS = ["session.idle", "question.asked"];

function notify(project, message) {
  const title = `OpenCode [${project}]`;
  switch (platform()) {
    case "linux":
      spawn("notify-send", ["-i", ICON_PATH, title, message], {
        stdio: "ignore",
        detached: true,
      }).unref();
      break;
    case "darwin":
      spawn(
        "osascript",
        [
          "-e",
          `display notification "${message.replace(/"/g, '\\"')}" with title "${title.replace(/"/g, '\\"')}"`,
        ],
        { stdio: "ignore", detached: true },
      ).unref();
      break;
    case "win32":
      spawn(
        "powershell.exe",
        [
          "-c",
          `
          $text1 = New-BTText -Content '${title.replace(/'/g, "''")}'
          $text2 = New-BTText -Content '${message.replace(/'/g, "''")}'
          $binding = New-BTBinding -Children $text1, $text2
          $visual = New-BTVisual -BindingGeneric $binding
          $content = New-BTContent -Visual $visual
          Submit-BTNotification -Content $content
        `,
        ],
        { stdio: "ignore", detached: true },
      ).unref();
      break;
  }
}

export default async (input) => {
  const project = basename(input.directory);

  return {
    event: async ({ event }) => {
      if (NOTIFY_EVENTS.includes(event.type)) {
        notify(project, event.type);
      }
    },
    "permission.ask": async () => {
      notify(project, "permission.ask");
    },
  };
};
