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

## Desktop App Folder Access

The Claude desktop app's file and diff panes show only folders granted to the session. The session's own folder is granted, and Claude grants another with `request_directory` or moves the session with `change_directory`. `permissions.additionalDirectories` in `settings.json` gives Claude Code access but does not grant a folder to the panes, and a shell `cd` does not move them either.

A grant asks the user to trust the folder as a workspace unless it sits inside an already trusted one. Trust is the same per-folder flag the CLI records in `~/.claude.json` when you accept its trust dialog, so trust a folder once per machine by starting `claude` in it:

```bash
cd ~/.local/share/ho-dev-notes && claude
```

After that, grants for [ho-dev-notes](../skills/ho-dev-notes/SKILL.md) happen without a prompt and notes open in the file pane. Trusting `~/code/personal` and `~/code/others` the same way covers sibling worktrees from [ho-worktrees](../skills/ho-worktrees/SKILL.md), because each one sits inside a trusted parent.

Trust also lets a project's `.claude/settings.json` apply without a prompt, including hooks that run shell commands. Under `~/code/others` that includes pull requests from outside contributors, so check whether a PR touches `.claude/` or `.mcp.json` (`gh pr diff <N> --name-only`) before starting a session in its worktree.

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
