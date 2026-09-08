# Moving from OpenCode to Codex

Notes from trying Codex CLI 0.153.4 alongside OpenCode. OpenCode comparisons refer to the local [session picker workflow](../opencode/README.md#session-picker).

## Resume and Fork

| Workflow | OpenCode session picker | Codex |
| --- | --- | --- |
| Pick a session to continue | `Enter` on the selected session | `codex resume` |
| Pick a session to fork | `Alt-Enter` on the selected session | `codex fork` |
| Continue or fork the latest session without a picker | Select it in the picker | `codex resume --last` or `codex fork --last` |
| Pick a session from inside the TUI | Use the session browser | `/resume` opens a picker |
| Fork the current conversation inside the TUI | Fork the selected session | `/fork` forks the current conversation directly, without a picker |

To branch off a session running in another tmux pane, open a second pane and run `codex fork`, then choose the source session. There is no need to resume it first. Use `codex fork <session-id>` to target it explicitly. The fork has its own conversation ID, but shares the working directory and does not create a Git worktree. The exact snapshot boundary for an in-progress turn has not been verified.

The local OpenCode picker supports full-content search with `-q` and previews recent conversation text. Do not assume the Codex pickers provide the same search and preview behavior.

## Worktree Scoping

Observed difference: Codex resume/fork lists are filtered by working directory, so sessions started in sibling worktrees do not appear together as they do in the OpenCode project workflow. Use `codex resume --all` or `codex fork --all` to remove that filter.

Local convention: start sessions from the main worktree so the default picker stays consistent, then explicitly tell the agent which worktree to work in. The session still starts rooted at main. When using the workspace sandbox, an additional worktree may need to be granted access with `--add-dir <worktree-path>`.

## YOLO Mode

`--yolo` is an alias for `--dangerously-bypass-approvals-and-sandbox`, which disables both approval prompts and sandboxing:

```sh
codex --yolo
codex resume --yolo
codex fork --yolo
```

The shell's `oc-yolo` helper only sets `OPENCODE_PERMISSION`, so it has no effect on Codex. Codex's `-a never` only disables approval prompts and does not remove the sandbox. Use `/permissions` to inspect or change permissions from the TUI.

## Terminal Wheel Scrolling

Observed locally: with tmux's `mouse off`, the wheel cycled Codex prompt history instead of scrolling output. `--no-alt-screen` did not resolve it. Enabling tmux mouse handling fixed scrolling:

```sh
tmux set -g mouse on
```

From inside Codex, press the tmux prefix (`Ctrl+B` by default), then `:`, type `set -g mouse on`, and press Enter. Press `q` to leave tmux copy mode when needed. For keyboard-only scrolling, prefix then `[` enters copy mode.

The `-g` option sets the default for all sessions in the current tmux server, including existing sessions and future ones. Session-specific overrides can take precedence. The setting lasts until the server exits. To persist it, add `set -g mouse on` to `~/.tmux.conf`. Use `tmux set -g mouse off` to undo the runtime setting.

OpenCode scrolled correctly with both settings. Mouse-aware TUIs request mouse reporting by writing terminal escape sequences, after which wheel movement arrives as encoded mouse input. tmux tracks those requests per pane. With its usual wheel bindings, `mouse on` forwards events to an application that requests them and otherwise scrolls pane history through copy mode. `mouse off` does not prevent an application from requesting and receiving mouse events itself.

This explains how OpenCode can handle its own conversation scrolling in either configuration, while tmux supplies scrollback for Codex in the working setup. The prompt-history symptom is consistent with wheel events becoming Up/Down keys, but Codex's exact mouse-reporting state and the translation point have not been traced locally.

## References

- [CLI commands and TUI shortcuts](https://learn.chatgpt.com/docs/developer-commands?surface=cli)
- [CLI customization](https://learn.chatgpt.com/docs/cli-customization)
