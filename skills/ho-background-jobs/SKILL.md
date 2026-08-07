---
name: ho-background-jobs
description: >-
  Start, stop, and inspect long-lived commands in tmux. Use only when the user explicitly invokes "ho-background-jobs" or "ho-bj".
---

# Background Jobs

Use one tmux session named `ho-bj`, with one window per long-lived command. Give each job a short lowercase slug such as `site-api` or `dotfiles-watch`.

## Start

```bash
ho-bj start <slug> [-C <root>] [--wait-timeout <seconds> | --no-wait] -- <command> [args...]
```

`-C` defaults to the current directory. Start waits up to five seconds for initial output, then reports whether the job is still running or exited. Use `--wait-timeout` to change this limit.
Use `--no-wait` to return immediately without capturing startup output.

## Stop

```bash
ho-bj stop <slug>
ho-bj stop --all
```

Use `--all` to stop every job and remove the shared tmux session.

## Logs

```bash
tmux capture-pane -p -S -200 -t '=ho-bj:=<slug>'
```

Adjust `-S` when more or less history is requested.

## List

```bash
ho-bj list
```

List output is tab-separated: slug, status, exit code, working directory, and current command. Exited jobs remain listed until stopped.

## Human Access

The human user can inspect or control jobs interactively:

```bash
tmux attach -t ho-bj
```
