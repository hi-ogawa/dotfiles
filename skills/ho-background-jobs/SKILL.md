---
name: ho-background-jobs
description: >-
  Start, stop, and inspect long-lived commands in tmux. Use only when the user explicitly invokes "ho-background-jobs" or "ho-bj".
---

# Background Jobs

Use one tmux session named `ho-bj`, with one window per long-lived command. Give each job a short lowercase slug such as `site-api` or `dotfiles-watch`.

## Start

```bash
# Ensure the shared session exists with an unused shell window
tmux has-session -t '=ho-bj' 2>/dev/null || tmux new-session -d -s ho-bj -n shell

# Create the job window.
tmux new-window -d -t '=ho-bj:' -n '<slug>' -c '<root>'

# Keep the window after the job exits.
tmux set-option -w -t '=ho-bj:=<slug>' remain-on-exit on

# Start the job.
tmux send-keys -t '=ho-bj:=<slug>' -l -- 'exec <command>'
tmux send-keys -t '=ho-bj:=<slug>' Enter
```

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
