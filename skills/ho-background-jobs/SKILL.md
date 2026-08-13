---
name: ho-background-jobs
description: >-
  Start, stop, and inspect long-lived commands in shared tmux workspaces. Use only when the user explicitly invokes "ho-background-jobs" or "ho-bj".
---

# Background Jobs

Use one named workspace window per long-lived command.

## Start

```bash
wtmux run --name <name> [-C <root>] [--wait-timeout <seconds> | --no-wait] -- <command> [args...]
```

`-C` defaults to the current directory. Run waits up to five seconds for initial output, then reports whether the command is still running or exited. Use `--wait-timeout` to change this limit.
Use `--no-wait` to return immediately without capturing startup output.

## Stop

```bash
wtmux stop --name <name>
```

Stop removes the named window and stops the processes running inside it.

## Logs

```bash
wtmux logs --name <name> [--lines <count>]
```

Logs show the latest 200 lines by default. Use `--lines` to change the amount. The command returns after printing current output and does not follow the command.

## List

```bash
wtmux list
```

List shows workspace status and pane details. Exited command windows remain listed until stopped.

## Human Access

The human user can inspect or control command windows interactively:

```bash
wtmux
```
