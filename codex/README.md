# Codex Configuration

User-level config for `~/.codex/`.

## Contents

- `config.toml` - user-level Codex config
- `AGENTS.md` - global instructions loaded into Codex sessions
- `hooks.json` - global Codex hook config
- `notify.sh` - desktop notification hook script

## Moving from OpenCode to Codex

See [Moving from OpenCode to Codex](opencode-to-codex.md) for session forks, worktree scoping, permissions, and tmux scrolling.

## Goal

Match what Claude does — add a `Co-authored-by` trailer to AI-assisted commits:

```
Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
```

Codex equivalent:

```
Co-authored-by: Codex <noreply@openai.com>
```

## Design

This setup uses `~/.codex/AGENTS.md` to instruct Codex to add the trailer when it writes or edits commit messages.

Codex does not currently enforce or deduplicate the trailer outside model instructions, so this is best-effort behavior. If exact enforcement becomes necessary, add a Git `commit-msg` hook layer rather than relying only on instructions.

## User-Level Instructions (`AGENTS.md`)

`~/.codex/AGENTS.md` is loaded as system instructions for every Codex session, across all projects. Use it for global policies that should always apply regardless of the project's own `AGENTS.md`.

Codex resolves `AGENTS.md` files in a hierarchy: `~/.codex/AGENTS.md` (lowest priority) → repo root → subdirectory closest to the working files (highest priority). All matched files are concatenated. Note: there are known issues where the global file is not read by default in some versions — see [#960](https://github.com/openai/codex/issues/960).

## Hooks and Notifications

This package enables hooks with `features.hooks = true` and installs two desktop notification handlers in `~/.codex/hooks.json`:

- `Stop` shows the final assistant message when a turn finishes.
- `PermissionRequest` shows “Approval requested” before an approval prompt.

The notification script calls the OS directly, so it does not depend on terminal notification support or tmux passthrough. It supports Linux `notify-send`, WSL/Git Bash through PowerShell BurntToast, and macOS `osascript`. Install `jq` to extract event details; without it, notifications use generic text. Agent-question notifications are not covered by this setup.

To install or update only the notification files, inspect the diff before applying:

```sh
./sync.sh diff codex/hooks.json codex/notify.sh
./sync.sh apply codex/hooks.json codex/notify.sh
```

Open `/hooks` in Codex and review and trust both notification handlers. New or changed hook definitions are skipped until trusted. If they do not appear, restart or resume Codex and open `/hooks` again.

Existing inline hooks in `~/.codex/config.toml`, such as git-ai checkpoints, run alongside these handlers. Codex merges both sources but warns when a config layer contains both inline hooks and `hooks.json`.

Codex also offers built-in terminal notifications through `tui.notifications`. These depend on the terminal notification method and may duplicate completion alerts if enabled alongside this script.

## References

- [Codex hooks](https://developers.openai.com/codex/hooks)
- [Configuration reference](https://developers.openai.com/codex/config-reference)
- [AGENTS.md hierarchy](https://github.com/openai/codex/blob/main/codex-cli/README.md#agentsmd)
