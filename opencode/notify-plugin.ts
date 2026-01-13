/**
 * OpenCode Notification Plugin
 *
 * Sends desktop notifications when:
 * - Session becomes idle (task completed)
 * - Permission is requested (agent blocked)
 *
 * Works on Linux (notify-send), macOS (osascript), and Windows (BurntToast)
 */

import type { Plugin } from "@opencode-ai/plugin"
import { spawn } from "node:child_process"
import { platform } from "node:os"
import { dirname, basename, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ICON_PATH = join(__dirname, "opencode-icon.png")

interface NotifyOptions {
  title: string
  message: string
  project?: string
}

function notify({ title, message, project }: NotifyOptions): void {
  const fullTitle = project ? `${title} [${project}]` : title

  switch (platform()) {
    case "linux": {
      spawn("notify-send", ["-i", ICON_PATH, fullTitle, message], {
        stdio: "ignore",
        detached: true,
      }).unref()
      break
    }

    case "win32": {
      // Use BurntToast PowerShell module for Windows notifications
      const script = `
        $text1 = New-BTText -Content '${fullTitle.replace(/'/g, "''")}'
        $text2 = New-BTText -Content '${message.replace(/'/g, "''")}'
        $iconPath = '${ICON_PATH.replace(/\\/g, "/")}'
        $logo = if (Test-Path $iconPath) { New-BTImage -Source $iconPath -AppLogoOverride } else { $null }
        $binding = if ($logo) { New-BTBinding -Children $text1, $text2 -AppLogoOverride $logo } else { New-BTBinding -Children $text1, $text2 }
        $visual = New-BTVisual -BindingGeneric $binding
        $content = New-BTContent -Visual $visual -ActivationType Protocol
        Submit-BTNotification -Content $content
      `
      spawn("powershell.exe", ["-c", script], {
        stdio: "ignore",
        detached: true,
      }).unref()
      break
    }

    case "darwin": {
      // macOS notification using osascript
      const osascript = `display notification "${message.replace(/"/g, '\\"')}" with title "${fullTitle.replace(/"/g, '\\"')}"`
      spawn("osascript", ["-e", osascript], {
        stdio: "ignore",
        detached: true,
      }).unref()
      break
    }
  }
}

const NotifyPlugin: Plugin = async (input) => {
  const project = basename(input.directory)

  return {
    event: async ({ event }) => {
      // Task completed - session is idle and waiting for input
      if (event.type === "session.idle") {
        notify({
          title: "OpenCode",
          message: "Task completed - ready for next instruction",
          project,
        })
      }

      // Permission requested - agent is blocked
      if (event.type === "permission.asked") {
        const permEvent = event as {
          type: string
          properties?: { permission?: string; patterns?: string[] }
        }
        const permission = permEvent.properties?.permission ?? "unknown"
        const patterns = permEvent.properties?.patterns?.join(", ") ?? ""
        notify({
          title: "OpenCode",
          message: `Permission needed: ${permission}${patterns ? ` (${patterns})` : ""}`,
          project,
        })
      }
    },
  }
}

export default NotifyPlugin
