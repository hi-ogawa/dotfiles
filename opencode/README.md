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

Icon from [OpenCode VSCode extension](https://github.com/sst/opencode/blob/dev/sdks/vscode/images/icon.png).

## Events

The plugin listens for these bus events:
- `session.idle` - Fires when session transitions to idle (task complete)
- `permission.asked` - Fires when permission approval is needed

## Community Alternatives

If you want sound support or npm-based installation:

| Plugin | Features | Install |
|--------|----------|---------|
| [opencode-notificator](https://github.com/panta82/opencode-notificator) | Sound per project (hash-based), simple JS | Local or npm |
| [opencode-notifier](https://github.com/mohak34/opencode-notifier) | Sound, error events, debouncing, external config | `@mohak34/opencode-notifier` |

Both use the same plugin API:
```typescript
{
  event: async ({ event }) => {
    // session.idle, permission.asked, session.error
  },
  "permission.ask": async (input, output) => {
    // Direct permission hook
  }
}
```
