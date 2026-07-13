---
name: ho-background-jobs
description: >-
  Run and manage long-lived shell commands as worktree-scoped tmux jobs. Use only when the user explicitly invokes "ho-background-jobs" or "ho-bj".
---

# Background Jobs

## Purpose

Use tmux for development servers, file watchers, and other long-lived commands
that must survive shell tool calls or agent sessions. Keep each job
discoverable, inspectable, and explicitly stoppable.

Do not use `&`, `nohup`, or a second background process inside tmux. The
workload must remain the pane's foreground process so tmux retains useful
ownership and exit status.

## Job Identity

Scope a job to its physical working directory and a short caller-supplied
purpose such as `ui`, `api`, or `watch`.

Derive the same name on every invocation:

1. Resolve the directory with `pwd -P` and call it `root`.
2. Sanitize its basename and the purpose by replacing each run of characters
   outside `[A-Za-z0-9_-]` with `-`, trimming leading and trailing `-`, and
   converting to lowercase. Reject an empty result.
3. Compute a stable SHA-256 checksum of the complete `root` and use its first
   six hexadecimal characters. Prefer `sha256sum`; use `shasum -a 256` when
   `sha256sum` is unavailable.
4. Build `ho-bg-<basename>-<checksum>-<purpose>`. Truncate only the sanitized
   basename so the complete name is at most 80 characters.

The checksum distinguishes worktrees with the same basename. Before acting on
an existing session, still verify that `pane_current_path` resolves to `root`.
A mismatch means the session is foreign or corrupt; report it and do not
modify it.

Use exact tmux targets (`-t "=$job"`) when supported. If the installed tmux
rejects exact-name syntax for an operation, resolve the session by comparing
`#{session_name}` for exact string equality, then target its `#{session_id}`.
Never fall back to an unverified prefix match.

## Inspect

Inspection is the shared first step for status, logs, reuse, restart, and stop.
Use `tmux list-panes -t "=$job" -F` and include:

- `#{session_id}` and `#{session_name}`;
- `#{pane_current_path}` and `#{pane_current_command}`;
- `#{pane_pid}`, `#{pane_dead}`, and `#{pane_dead_status}`.

Also read the session options `@ho-bg-root` and `@ho-bg-command`. These retain
the full canonical path and requested command because `pane_current_command`
usually exposes only the wrapper or executable name. Missing metadata means a
legacy or foreign session; report it rather than adopting it automatically.

Capture recent output with `tmux capture-pane -p -t "=$job"`. Increase the
history range when startup output has scrolled away. Do not attach or follow
output indefinitely because that blocks the agent.

Classify the job as one of:

- **missing**: no exact session exists;
- **starting**: the pane is live but readiness has not succeeded;
- **ready**: the pane is live and its readiness check succeeds;
- **completed**: the retained pane exited successfully;
- **failed**: the retained pane exited unsuccessfully;
- **expired**: the runtime wrapper exited with its documented timeout status;
- **stopped**: the session was explicitly removed.

Report the job name, working directory, pane command, state, exit status when
available, and service URL or port when relevant. Process existence alone does
not establish readiness.

## Start Or Reuse

1. Derive the identity and inspect the exact session.
2. Reuse it only when its path and `@ho-bg-command` match and it is ready.
3. If it is starting, inspect recent output and continue a bounded readiness
   check rather than creating a duplicate.
4. If it is completed, failed, or expired, preserve its output in the report,
   remove the retained session, and create a new one only when the requested
   operation is start or restart.
5. If it is missing, create a detached session running the default shell in
   `root`.
6. Enable `remain-on-exit` before launching the workload. This preserves
   evidence from fast startup failures.
7. Store `root` and the exact requested command in the session options
   `@ho-bg-root` and `@ho-bg-command`.
8. Verify that the shell pane is live and still in `root`. Send one
   shell-escaped command line using literal input (`send-keys -l`), then send
   `Enter`. Prefix the line with `exec` so the wrapper becomes the pane's
   foreground process.
9. Poll readiness with a finite deadline. Use a service-specific probe when
   available; otherwise require a live pane and inspect output for startup
   failure. Report a readiness timeout as `starting`, not `ready`.

The retention-safe launch sequence is:

```bash
tmux new-session -d -s "$job" -c "$root"
tmux set-option -t "$job" remain-on-exit on
tmux set-option -t "$job" @ho-bg-root "$root"
tmux set-option -t "$job" @ho-bg-command "$command"
tmux send-keys -t "$job" -l -- "$escaped_exec_line"
tmux send-keys -t "$job" Enter
```

Construct `escaped_exec_line` as one shell command; do not interpolate raw
user text into it. If setup fails, inspect for a partially created session
before retrying.

### Runtime Limit

Use a finite runtime unless the user explicitly requests an unbounded job.
Default interactive development servers to four hours.

Detect the wrapper before creating the session:

- use `timeout` when available;
- otherwise use `gtimeout` when available, as commonly installed by GNU
  coreutils on macOS;
- if neither exists, ask whether to run unbounded rather than silently
  changing the requested lifecycle.

The runtime limit bounds the workload, not the retained tmux session.
`remain-on-exit` intentionally keeps the dead pane for later diagnosis until a
subsequent inspection removes it.

## Restart

Inspect first. For a live job, capture recent output and stop its exact session.
For a completed, failed, or expired job, capture output and remove the retained
session. Then follow **Start Or Reuse** to create a fresh session with the same
identity. Do not use `respawn-pane`, because it discards evidence and makes
setup state less explicit.

## Stop

Inspect first, then run `tmux kill-session -t "=$job"`. Confirm that the exact
session is gone. Killing a session normally terminates its foreground workload
but cannot guarantee removal of descendants that deliberately daemonized or
detached, so also verify the workload-specific endpoint or resource when one
is known.

Never kill by a broad process name such as `pkill vite`; another session or
worktree may own a matching process.

## Ownership And Cleanup

- Keep a ready job alive while it supports an active interactive workflow.
- Stop it when the user finishes that workflow or requests cleanup.
- On later invocation, inspect and reuse a matching ready job instead of
  starting a duplicate.
- Remove a completed, failed, or expired session only after reporting its
  output and exit status, and only when starting/restarting it or when cleanup
  was requested.
- Before cleaning unfamiliar `ho-bg-*` sessions, list them and confirm with the
  user. Another active agent or worktree may own them.
