# OpenCode Notification Plugin

Desktop notifications for OpenCode when:
- **Task completed** (`session.idle`) - Agent finished and waiting for next instruction
- **Permission needed** (`permission.asked`) - Agent blocked waiting for approval

## Setup

Run `./sync.sh apply opencode` to install the plugin to `~/.opencode/plugins/`.

OpenCode automatically discovers and loads plugins from this directory - no additional configuration needed.

## Requirements

### Linux
- `notify-send` (usually pre-installed, part of `libnotify-bin`)

### Windows
- PowerShell with [BurntToast](https://github.com/Windos/BurntToast) module:
  ```powershell
  Install-Module -Name BurntToast
  ```

### macOS
- No additional requirements (uses built-in `osascript`)

## Icon

Replace `opencode-icon.png` with your preferred icon (currently using Claude icon as placeholder).

## Events

The plugin listens for these bus events:
- `session.idle` - Fires when session transitions to idle (task complete)
- `permission.asked` - Fires when permission approval is needed
