# OpenCode Configuration

User-level OpenCode config, global instructions, desktop notifications, and optional headless server setup.

## Contents

- `opencode.json` - user-level OpenCode config
- `AGENTS.md` - global instructions loaded across OpenCode sessions
- `notify.js` - desktop notification plugin
- `notify-icon.png` - notification icon
- `opencode.service` - optional systemd user service for `opencode serve`

## Setup

Run `./sync.sh apply opencode` to install:

- global rules to `~/.config/opencode/AGENTS.md`
- config to `~/.config/opencode/opencode.json`
- notification plugin files to `~/.opencode/plugins/`

## Global Rules

`AGENTS.md` is installed to `~/.config/opencode/AGENTS.md` and loaded as user-level global instructions across OpenCode sessions.

It includes personal Git policy and agent attribution:

```text
AI-Agent: Opencode
```

This is instruction-based only. It tags commits with the agent used without using GitHub co-author semantics or a synthetic email identity.

## Notification Plugin

The notification plugin sends desktop notifications for OpenCode events that need user attention.

OpenCode automatically discovers and loads plugins from `~/.opencode/plugins/` in this setup; no additional configuration is needed.

## Headless Server (systemd user service)

This repo also includes `opencode/opencode.service` for running `opencode serve` as a user daemon.

The service starts through a login Bash shell so it picks up your normal shell environment
(`~/.bash_profile` -> `~/.bashrc`), matching terminal behavior for `PATH` tools such as
Node/Corepack/pnpm.

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

## References

- [OpenCode docs](https://opencode.ai/docs)
