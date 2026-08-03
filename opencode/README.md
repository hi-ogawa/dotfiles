# OpenCode Configuration

User-level OpenCode config, global instructions, desktop notifications, and optional headless server setup.

## Contents

- `opencode.json` - user-level OpenCode config
- `AGENTS.md` - global instructions loaded across OpenCode sessions
- `notify.js` - desktop notification plugin
- `notify-icon.png` - notification icon
- `opencode.service` - optional systemd user service for `opencode serve`
- `session-picker.sh` - recent-session browser with continue and fork actions

## Setup

Run `./sync.sh apply opencode` to install:

- global rules to `~/.config/opencode/AGENTS.md`
- config to `~/.config/opencode/opencode.json`
- notification plugin files to `~/.config/opencode/plugins/`
- session picker to `~/.local/bin/opencode-session-picker`

## Session Picker

`opencode-session-picker` opens the current project's recent sessions in a two-pane browser. The list is ordered by latest activity, while the preview shows the selected session's recent user and assistant text.

- `Enter` continues the selected session.
- `Ctrl+F` forks the selected session.
- `Esc` exits without starting OpenCode.

The picker requires `opencode`, `jq`, `fzf`, and `sqlite3` on `PATH`.

## Global Rules

`AGENTS.md` is installed to `~/.config/opencode/AGENTS.md` and loaded as user-level global instructions across OpenCode sessions.

It includes personal Git policy and agent attribution:

```text
Co-authored-by: OpenCode (gpt-5.5) <noreply@opencode.ai>
```

This is instruction-based only. It uses GitHub co-author semantics with the current OpenCode model name in parentheses.

## Notification Plugin

The notification plugin sends desktop notifications for OpenCode events that need user attention.

OpenCode automatically discovers and loads global plugins from `~/.config/opencode/plugins/`; no additional configuration is needed.

### Official TUI Attention

OpenCode also has built-in TUI attention support, configured separately in `~/.config/opencode/tui.json`:

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "attention": {
    "enabled": true,
    "notifications": true,
    "sound": true,
    "volume": 0.4
  }
}
```

The built-in implementation:

- notifies for questions, permissions, session errors, and active sessions becoming idle
- deduplicates pending question and permission requests
- suppresses the completion notification following a session error
- uses distinct sounds for questions, permissions, errors, completed sessions, and completed subagents
- plays sounds regardless of terminal focus
- requests desktop notifications only when the terminal is blurred
- suppresses desktop notifications for subagent sessions

Built-in desktop notifications are terminal-mediated rather than direct OS calls. OpenCode calls OpenTUI's `renderer.triggerNotification()`, which emits the non-standard OSC 9 terminal notification sequence. The terminal emulator must translate that sequence into a native desktop notification.

Verified terminal support:

| Terminal                    | OSC 9 desktop notifications                                  |
| --------------------------- | ------------------------------------------------------------ |
| Ghostty                     | Supported and documented                                     |
| iTerm2                      | Supported; OSC 9 originated as an iTerm extension            |
| WezTerm                     | Supported; notification behavior is configurable             |
| kitty                       | Supported; kitty also provides its richer OSC 99 protocol    |
| Alacritty                   | Not supported                                                 |
| Windows Terminal            | Do not rely on it; OSC 9 is used for ConEmu-style commands   |
| VS Code integrated terminal | No documented OSC 9 desktop-notification support             |
| tmux / screen               | May filter the sequence unless passthrough is configured      |

The local plugin remains useful because it bypasses the terminal and invokes the platform notification service directly:

- Linux: `notify-send`
- macOS: `osascript`
- Windows and WSL: BurntToast through PowerShell

This direct path works independently of terminal OSC support, preserves separate title and body fields, supports the custom icon, and also works outside the interactive TUI. Unlike built-in attention, it always notifies and does not provide sounds, request deduplication, session-error handling, or subagent-specific behavior.

Keep the local plugin for reliable notifications across terminals, WSL, and headless/server workflows. Prefer built-in TUI attention when using a supported terminal and blur-aware notifications plus sounds are more important. Enabling both can produce duplicate notifications when the terminal is blurred.

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
