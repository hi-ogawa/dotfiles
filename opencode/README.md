# OpenCode Notification Plugin

Desktop notifications for OpenCode events that need user attention.

## Setup

Run `./sync.sh apply opencode` to install the plugin to `~/.opencode/plugins/`.

OpenCode automatically discovers and loads plugins from this directory - no additional configuration needed.

## Headless Server (systemd user service)

This repo also includes `opencode/opencode.service` for running `opencode serve` as a user daemon.

1. Install the unit:

   ```bash
   ./sync.sh apply opencode.service
   ```

2. Start and enable:

   ```bash
   systemctl --user daemon-reload
   systemctl --user enable --now opencode
   ```

3. Verify:

   ```bash
   systemctl --user status opencode
   curl http://127.0.0.1:4096/global/health
   ```

4. Tail logs:

   ```bash
   journalctl --user -u opencode -f
   ```

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

- `session.idle`
- `question.asked`
- `permission.ask` (v2 hook)

## Community Alternatives

If you want sound support or npm-based installation:

| Plugin                                                                  | Features                                         | Install                      |
| ----------------------------------------------------------------------- | ------------------------------------------------ | ---------------------------- |
| [opencode-notificator](https://github.com/panta82/opencode-notificator) | Sound per project (hash-based), simple JS        | Local or npm                 |
| [opencode-notifier](https://github.com/mohak34/opencode-notifier)       | Sound, error events, debouncing, external config | `@mohak34/opencode-notifier` |

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
