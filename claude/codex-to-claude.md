# Moving from Codex to Claude Code

Notes from returning to Claude Code 2.1.282 after using Codex. Codex comparisons refer to [Moving from OpenCode to Codex](../codex/opencode-to-codex.md).

## Resume and Fork

| Workflow | Codex | Claude Code |
| --- | --- | --- |
| Pick a session to continue | `codex resume` | `claude -r`, or `claude -r "<search term>"` |
| Pick a session to fork | `codex fork` | `claude -r --fork-session` |
| Continue the latest session | `codex resume --last` | `claude -c` |
| Fork the latest session | `codex fork --last` | `claude -c --fork-session` |
| Fork a specific session | `codex fork <session-id>` | `claude -r <session-id> --fork-session` |
| Pick a session from inside the TUI | `/resume` | `/resume` |
| Fork the current conversation inside the TUI | `/fork` | `/branch [name]` |
| Fork from an earlier message | Not covered | `Esc Esc` or `/rewind`, then continue from the chosen point |

`/fork` does not mean the same thing in the two tools. Codex `/fork` switches you into the forked conversation, while Claude's `/fork` copies the conversation into a new background session and keeps you in the current one. The in-place equivalent of Codex `/fork` is Claude's `/branch`.

To branch off a session running in another tmux pane, open a second pane and run `claude -r --fork-session`, then choose the source session. As with Codex, the fork gets a new session ID, shares the working directory, and does not create a Git worktree. The exact snapshot boundary for an in-progress turn has not been verified.

## Background Sessions

Claude Code can run sessions detached from the terminal, which Codex does not do. `wtmux` covers the same ground without depending on any one agent CLI, because it runs any command in a named tmux window shared across a repository's worktrees. The local workflow stays on `wtmux` for now, so this section records the contrast rather than a switch.

| Action | `wtmux` | Claude Code |
| --- | --- | --- |
| Start a session | `wtmux run --name <name> --no-wait -- claude '<prompt>'` | `claude --bg '<prompt>'` |
| List sessions | `wtmux list` | `claude agents` |
| Follow a session | Switch to its tmux window | `claude attach <id>` |
| Read recent output | `wtmux logs --name <name>` | `claude logs <id>` |
| Stop a session | `wtmux stop --name <name>` | `claude stop <id>`, which keeps the conversation |
| Branch off the current session | Not covered | `/fork [prompt]`, which copies the conversation into a background session |

The main differences:

- `wtmux` works the same for OpenCode, Codex, Claude Code, and non-agent commands such as dev servers, while Claude background sessions only manage Claude.
- `wtmux` windows are ordinary tmux windows, so every session is visible and interactive without attaching. Claude background sessions run hidden until attached.
- Claude background sessions know about the conversation, so they can continue or copy a session (`claude --bg -r <session-id>`, `/fork`) and remove their worktree on `claude rm`. `wtmux` only knows about the command it runs.

Choose between a fork and a fresh [handoff](../skills/ho-background-jobs/references/handoff.md) by how much context the new session needs. A fork inherits the whole conversation, while a handoff starts clean from a short prompt the agent writes. With `wtmux`, a fork can still run in a shared window as `wtmux run --name <name> --no-wait -- claude -r <session-id> --fork-session`.

## Worktree Scoping

Whether the `/resume` picker lists sessions started in sibling worktrees, and whether it can widen to all projects like `codex resume --all`, has not been verified locally.

`claude -w <name>` creates its own Git worktree for the session. That worktree does not follow the [ho-worktrees](../skills/ho-worktrees/SKILL.md) sibling-directory naming convention, so keep the Codex convention instead. Start sessions from the main worktree and tell the agent which worktree to work in.

## YOLO Mode

`--dangerously-skip-permissions` bypasses all permission checks, like Codex `--yolo`. It combines with resume and fork:

```sh
claude --dangerously-skip-permissions
claude -r --fork-session --dangerously-skip-permissions
```

`--permission-mode <mode>` selects a less drastic mode, and `/permissions` inspects or changes rules from the TUI. The shell's `oc-yolo` helper only sets `OPENCODE_PERMISSION`, so it has no effect on Claude Code.

## Session Search

The OpenCode picker's `-q` searches full session content, but it has not been verified whether `claude -r "<search term>"` does too. Claude Code stores transcripts as JSONL files under `~/.claude/projects/<cwd-slug>/`, so `grep` over that directory works as a fallback. The [ho-sessions](../skills/ho-sessions/SKILL.md) skill currently reads only the OpenCode database.

## References

- [CLI reference](https://code.claude.com/docs/en/cli-reference)
- [Common workflows](https://code.claude.com/docs/en/common-workflows)
