---
name: ho-background-jobs
description: >-
  Start, stop, and inspect long-lived commands in tmux. Use only when the user explicitly invokes "ho-background-jobs" or "ho-bj".
---

# Background Jobs

Use one tmux session named `ho-bj`, with one window per long-lived command. Give each job a short lowercase slug such as `site-api` or `dotfiles-watch`.

## Start

```bash
ho-bj start <slug> -C <root> -- <command> [args...]
```

`-C` defaults to the current directory. Start waits briefly for initial output, then reports whether the job is still running or exited.

## Stop

```bash
tmux kill-window -t '=ho-bj:=<slug>'
```

## Logs

```bash
tmux capture-pane -p -S -200 -t '=ho-bj:=<slug>'
```

Adjust `-S` when more or less history is requested.

## List

```bash
tmux list-windows -t '=ho-bj' -F '#{window_name} #{pane_current_path} #{pane_current_command} dead=#{pane_dead} exit=#{pane_dead_status}'
```

## Human Access

The human user can inspect or control jobs interactively:

```bash
tmux attach -t ho-bj
```
