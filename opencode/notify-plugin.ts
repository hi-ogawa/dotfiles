/**
 * OpenCode Notification Plugin
 *
 * Sends desktop notifications when:
 * - Session becomes idle (task completed)
 * - Permission is requested (agent blocked)
 *
 * Works on Linux (notify-send), macOS (osascript), and Windows (BurntToast)
 */

import type { Plugin } from "@opencode-ai/plugin";
import { spawn } from "node:child_process";
import { platform } from "node:os";
import { basename, join } from "node:path";

const ICON_PATH = join(import.meta.dirname, "opencode-icon.png");

function notify(options: { message: string; project: string }): void {
  const fullTitle = `OpenCode [${options.project}]`;
  switch (platform()) {
    case "linux": {
      spawn("notify-send", ["-i", ICON_PATH, fullTitle, options.message], {
        stdio: "ignore",
        detached: true,
      }).unref();
      break;
    }

    case "win32": {
      // Use BurntToast PowerShell module for Windows notifications
      const script = `
        $text1 = New-BTText -Content '${fullTitle.replace(/'/g, "''")}'
        $text2 = New-BTText -Content '${options.message.replace(/'/g, "''")}'
        $iconPath = '${ICON_PATH.replace(/\\/g, "/")}'
        $logo = if (Test-Path $iconPath) { New-BTImage -Source $iconPath -AppLogoOverride } else { $null }
        $binding = if ($logo) { New-BTBinding -Children $text1, $text2 -AppLogoOverride $logo } else { New-BTBinding -Children $text1, $text2 }
        $visual = New-BTVisual -BindingGeneric $binding
        $content = New-BTContent -Visual $visual -ActivationType Protocol
        Submit-BTNotification -Content $content
      `;
      spawn("powershell.exe", ["-c", script], {
        stdio: "ignore",
        detached: true,
      }).unref();
      break;
    }

    case "darwin": {
      // macOS notification using osascript
      const osascript = `display notification "${options.message.replace(/"/g, '\\"')}" with title "${fullTitle.replace(/"/g, '\\"')}"`;
      spawn("osascript", ["-e", osascript], {
        stdio: "ignore",
        detached: true,
      }).unref();
      break;
    }
  }
}

const NotifyPlugin: Plugin = async (input) => {
  const project = basename(input.directory);

  return {
    event: async ({ event }) => {
      // Task completed - session is idle and waiting for input
      if (event.type === "session.idle") {
        notify({
          message: "Task completed - ready for next instruction",
          project,
        });
      }
    },

    // Permission requested - agent is blocked (v2 hook)
    "permission.ask": async (input, _output) => {
      const patterns = Array.isArray(input.pattern)
        ? input.pattern.join(", ")
        : (input.pattern ?? "");
      notify({
        message: `Permission needed: ${input.type}${patterns ? ` (${patterns})` : ""}`,
        project,
      });
    },
  };
};

export default NotifyPlugin;
