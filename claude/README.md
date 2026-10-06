# Claude Code Configuration

## Files

- `settings.json` - Shared settings for `~/.claude/settings.json`. Merge by hand because the local file keeps machine-specific keys such as `env`
- `notify.mjs` - Desktop notification hook script
- `CLAUDE.md` - Synced to `~/.claude/CLAUDE.md`

`CLAUDE.md` is maintained separately from `../codex/AGENTS.md` and `../opencode/AGENTS.md`, so port shared sections by hand. It has no attribution rules. `settings.json` sets `attribution.pr` to an empty string, so pull request descriptions carry no Claude Code line, while commits keep the default `Co-Authored-By` trailer.

See [Moving from Codex to Claude Code](codex-to-claude.md) for session forks, background sessions, worktree scoping, and permissions.

## User-Level Instructions (`CLAUDE.md`)

`~/.claude/CLAUDE.md` is loaded as system instructions for every Claude Code session, across all projects. Use it for global policies that should always apply regardless of the project's own `CLAUDE.md`.

Multiple `CLAUDE.md` files can coexist at different scopes and are all loaded. Priority order (highest to lowest): managed policy (`/etc/claude-code/CLAUDE.md`) → project-level (`./CLAUDE.md`) → user-level (`~/.claude/CLAUDE.md`).

- [Memory and instructions docs](https://code.claude.com/docs/en/memory)

## Worktrees

Claude Code manages its own worktrees under `<repo>/.claude/worktrees/` (`claude -w`, EnterWorktree), and a forked session can receive a system reminder to isolate into one before editing. While a session is inside such a worktree, it can only switch to other worktrees there and refuses shell commands it cannot statically verify, which cannot be turned off. That conflicts with the [ho-worktrees](../skills/ho-worktrees/SKILL.md) sibling convention, so `CLAUDE.md` tells Claude to ignore the fork reminder.

- [Worktrees docs](https://code.claude.com/docs/en/worktrees.md)

## Notifications

`settings.json` runs `notify.mjs` from two hooks:

- `Stop` shows the final assistant message when a turn finishes.
- `Notification` shows the notification text for permission prompts and MCP elicitation dialogs. Claude Code sends these only after about six seconds without typing, so they skip prompts you are already watching.

`idle_prompt` is left out because `Stop` already covers a finished turn.

The script calls the OS directly, so it does not depend on terminal notification support or tmux passthrough. It supports Linux `notify-send`, WSL through PowerShell [BurntToast](https://github.com/Windos/BurntToast), and macOS `osascript`. Requires Node.js on `PATH`. It is a copy of [`../codex/notify.mjs`](../codex/notify.mjs) with the title and message adjusted for Claude Code, so port fixes by hand.

Claude Code also has built-in desktop notifications in iTerm2, Ghostty, and Kitty. `preferredNotifChannel` is set to `notifications_disabled` so they do not duplicate the hook. Hooks still run with that value.

- [Terminal notifications](https://code.claude.com/docs/en/terminal-config#get-a-terminal-bell-or-notification)
- [Notification hook](https://code.claude.com/docs/en/hooks#notification)

## See Also

- [Claude Code settings](https://code.claude.com/docs/en/settings)
- [Claude Code Hooks Docs](https://code.claude.com/docs/en/hooks)
