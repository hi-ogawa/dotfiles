---
name: ho-worktrees
description: >-
  Answer worktree-related questions and take worktree-related actions. Use only when the user explicitly invokes "ho-worktrees".
---

# Worktrees

## Purpose

Answer worktree-related questions and take worktree-related actions by reading git state and GitHub context. Infer intent from the request — don't default to a full listing unless that's what's asked.

Common intents:

- **Find** — "where was I on the snapshot issue", "which worktree has pr 10466" → locate and describe the one relevant worktree.
- **Survey** — "what's alive", "show all worktrees" → full status table.
- **Create** — "worktree for pr 10466", "new worktree for issue 9812" → create following the naming convention.
- **Clean** — "remove stale ones", "clean up" → identify candidates and confirm before removing.

## Naming Convention

Worktree directories live as siblings of the main worktree:

```
<repo>-pr-<NNNN>       # reviewing or working on a pull request
<repo>-issue-<NNNN>    # fix branch after triage of an issue
<repo>-<slug>          # experiment or topic with no issue/PR anchor
```

Examples: `vitest-pr-10466`, `vitest-issue-9812`, `vitest-snapshot-perf`.

The `<repo>` prefix is the main worktree's directory name. Avoid opaque names like `vitest-wt3`.

## Creation

Determine the type from context:

- **PR**: `git worktree add ../<repo>-pr-<N>`, then `gh pr checkout <N>` inside it.
- **Issue fix**: `git worktree add ../<repo>-issue-<N> -b fix/issue-<N>`.
- **Experiment**: `git worktree add ../<repo>-<slug> -b <slug>`.

Always base new worktrees off the current main branch tip.

## Status Query

Prune first (`git worktree prune`) to clear stale entries from manually deleted directories.

Gather what's needed to classify each non-main worktree:

- **Type** — inferred from directory name (pr/issue/experiment).
- **Git state** — dirty, commits ahead of main.
- **PR state** — for PR-shaped worktrees, fetch via `gh`.
- **Linked dev-note** — search `ho-dev-notes/<repo>/` for lines containing `Worktree:` to find notes with a worktree path. Always read the `ho-dev-notes` skill first to determine the base directory to search for.

Classification:

- **stale** — clean, zero ahead, no open PR.
- **local work** — dirty or commits ahead, no PR yet.
- **pr open** — PR exists and is open.
- **pr merged/closed** — PR is done; worktree can likely be removed.

## Cleanup

When the user asks to clean up or remove worktrees:

1. Run a survey first (which prunes stale entries), collect stale candidates (clean, zero ahead, no open PR).
2. List the candidates and confirm with the user before removing.

## Output

Match the output to the intent:

- **Find** — one entry: path, branch, status, and any linked dev-note.
- **Survey** — terse table, one row per non-main worktree:

  ```
  vitest-pr-10466    pr open      "Fix snapshot serializer"   clean, 2 ahead
  vitest-issue-9812  local work   fix/issue-9812              3 files dirty
  vitest-wt4         stale        vitest-wt4                  same as main
  ```

  Flag stale worktrees. After the table, list any worktrees whose names don't follow the convention as **unnamed**.

- **Create / Clean** — confirm the action taken or the proposed commands.
