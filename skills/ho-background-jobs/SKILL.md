---
name: ho-background-jobs
description: >-
  Run and manage long-lived shell commands as worktree-scoped tmux jobs. Use only when the user explicitly invokes "ho-background-jobs" or "ho-bj".
---

# Background Jobs

## Purpose

Use tmux to run development servers, file watchers, and other long-lived
commands without blocking the agent. Jobs intentionally survive individual
shell tool calls and agent sessions, while remaining discoverable and
explicitly stoppable.

Do not use raw shell backgrounding (`&` or `nohup`) for long-lived commands.
It provides no reliable ownership, discovery, log inspection, or cleanup.

## Job Identity

Scope every job to both the canonical working directory and a short purpose
supplied by the caller, such as `ui`, `api`, or `watch`.

Build a tmux session name in this form:

```text
ho-bg-<directory>-<purpose>
```

- Resolve the working directory physically with `pwd -P`.
- Use its directory basename as the worktree component.
- Sanitize the basename and purpose to `[a-zA-Z0-9_-]`.
- Keep the resulting name short enough to read in `tmux list-sessions`.

The purpose lets one worktree own multiple independent jobs. If unrelated
working directories have the same basename, list the existing session and
verify its `pane_current_path` before reusing or modifying it.

Use exact tmux targets by prefixing the session name with `=` when a tmux
command accepts a target. This avoids tmux's prefix matching selecting another
job.

## Lifecycle

### Start

1. Derive the job identity.
2. Check it with `tmux has-session -t "=$job"`.
3. If it exists, inspect its command and recent output. Reuse it only when it
   is the intended healthy job.
4. Otherwise, create a detached session in the canonical working directory
   with `tmux new-session -d -s "$job" -c "$root" <command>`.
5. Set `remain-on-exit` for the session so startup failures and exit status
   remain inspectable.
6. Apply a finite maximum runtime with `timeout` unless the user explicitly
   requests an unbounded job. Default to four hours for interactive
   development servers.
7. Inspect output and perform a service-specific readiness check before
   reporting success. A live tmux session alone does not prove readiness.

Pass the long-running command as the tmux pane's foreground command. Do not
start another background process inside tmux.

### Status

Use tmux's formatted output to inspect the exact session and pane. Report at
least:

- job name;
- working directory;
- pane command;
- whether the pane is running or exited;
- pane exit status when available;
- service URL or port when relevant.

Do not infer health only from process existence. Use the service's readiness
check when one is available.

Use `tmux list-panes -t "=$job" -F` with fields including
`#{pane_dead}`, `#{pane_dead_status}`, `#{pane_pid}`, `#{pane_current_command}`,
and `#{pane_current_path}`. This distinguishes a running pane from an exited
pane retained by `remain-on-exit` and verifies that a same-named session
belongs to the expected worktree.

### Recover

Before starting or reusing a job, probe an existing session:

- If its pane is dead, capture its output and exit status, then kill the stale
  tmux session before starting a replacement.
- If its pane is running but the command or working directory is unexpected,
  do not adopt or kill it. Report the collision to the user.
- If its pane is running with the expected command but its service readiness
  check fails, inspect recent output. Restart it only when the output confirms
  that it is failed or irrecoverably stuck; otherwise report the ambiguity.
- If no session exists but the expected endpoint responds, do not kill the
  unknown owner. Choose another dynamically allocated port or ask the user.

This recovery handles stale tmux sessions and dead retained panes. It does not
claim ownership of unrelated orphan processes that are no longer represented
by the named tmux session.

### Logs

Read recent output with `tmux capture-pane -p -t "=$job"`. Increase the capture
range when startup output has scrolled beyond the visible pane. Prefer a
one-time capture over attaching or following indefinitely because those would
block the agent.

### Stop

Stop a job with `tmux kill-session -t "=$job"`. This removes the tmux-owned
pane and its foreground process tree. Confirm that the session no longer
exists and, for a network service, that its known endpoint no longer responds.

Never kill by broad process name, such as `pkill vite`, because other sessions
or worktrees may own matching processes.

## Ownership And Cleanup

- Keep a job alive across feedback messages when it supports an active
  interactive workflow.
- Stop it when the user finishes that workflow or asks for cleanup.
- If the agent session ends unexpectedly, the tmux job may remain until its
  timeout. This persistence is intentional and bounded.
- On a later invocation for the same worktree and purpose, inspect and reuse a
  healthy existing job instead of starting a duplicate.
- Remove exited sessions after their output and exit status have been
  inspected.
- Before cleaning unfamiliar `ho-bg-*` sessions, list them and confirm with
  the user. Another active agent or worktree may own them.

## Interactive Servers

For servers that can select an available port, request dynamic allocation
rather than assuming a conventional port. Capture the actual URL from startup
output, verify that exact endpoint, and keep reporting the same URL throughout
the feedback loop.

The caller remains responsible for application-specific details such as the
start command, readiness endpoint, expected startup text, and final checks.
