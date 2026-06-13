# Claude Code Configuration

## Notifications

Claude Code can trigger notifications via [hooks](https://code.claude.com/docs/en/hooks) when waiting for input (permission prompts, idle).

### Notification Tools Landscape

**Cross-platform CLI tools:**

| Tool                                                       | Windows | Linux | Notes                                                      |
| ---------------------------------------------------------- | ------- | ----- | ---------------------------------------------------------- |
| [node-notifier](https://github.com/mikaelbr/node-notifier) | Yes     | Yes   | npm package, uses native notifications                     |
| [ntfy](https://ntfy.sh/)                                   | Yes     | Yes   | Pub/sub service, requires subscription (browser/phone/app) |
| [claude-notify](https://github.com/mylee04/claude-notify)  | Yes     | Yes   | Made for Claude Code, wraps OS-specific tools              |

**Windows-only:**

| Tool                                                              | Notes                                         |
| ----------------------------------------------------------------- | --------------------------------------------- |
| [BurntToast](https://github.com/Windos/BurntToast)                | PowerShell module, native toast notifications |
| [wsl-notify-send](https://github.com/stuartleeks/wsl-notify-send) | WSL only, mimics notify-send                  |
| `[Console]::Beep()`                                               | Built-in PowerShell, audio only               |
| topnotify                                                         | Available via `scoop install topnotify`       |

**Linux-only:**

| Tool        | Notes                    |
| ----------- | ------------------------ |
| notify-send | Standard, uses libnotify |

### Beep (Windows)

Simple audio notification:

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "powershell.exe -c \"[Console]::Beep(800,200)\""
          }
        ]
      }
    ]
  }
}
```

- `800` = frequency in Hz
- `200` = duration in ms
- Empty `matcher` catches all notification types

### Windows: Toast Notifications

For OS-level toast notifications, install [BurntToast](https://github.com/Windos/BurntToast):

```powershell
Install-Module -Name BurntToast -Scope CurrentUser
New-BurntToastNotification -Text 'Claude Code', 'Waiting for input'
```

### Custom Script with Hook Input

Hooks receive [JSON input via stdin](https://code.claude.com/docs/en/hooks#notification-input):

```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/current/dir",
  "hook_event_name": "Notification",
  "message": "Claude needs your permission to use Bash",
  "notification_type": "permission_prompt"
}
```

See [notify.sh](https://github.com/hi-ogawa/dotfiles/blob/main/claude/notify.sh) for a script that parses this and shows the actual message:

```json
{
  "command": "bash ~/.claude/notify.sh"
}
```

### Notification Matchers

- `""` - All notifications
- `permission_prompt` - Permission requests only
- `idle_prompt` - Idle for 60+ seconds

### What Doesn't Work

- `printf '\a'` - Terminal bell doesn't work in Git Bash/WezTerm
- `notify-send` - Linux only, not available in Git Bash

## See Also

- [claude/settings.json](https://github.com/hi-ogawa/dotfiles/blob/main/claude/settings.json) - Current configuration
- [claude/notify.sh](https://github.com/hi-ogawa/dotfiles/blob/main/claude/notify.sh) - Notification script
- [Claude Code Hooks Docs](https://code.claude.com/docs/en/hooks)
