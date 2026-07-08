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

- **PR**: Create the worktree with `git worktree add --detach ../<repo>-pr-<N>`. Then run `gh pr checkout <N>` as a separate command with its working directory set to `../<repo>-pr-<N>`. Never run `gh pr checkout` from the main worktree.
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

- **active** — dirty, has unexplained local commits, or belongs to an open PR.
- **stale** — clean and either has no commits ahead of `main`, or belongs to a merged or closed PR. Ahead commits do not prevent a merged or closed PR worktree from being stale because squash and rebase merges commonly leave commits unreachable from `main`.

Do not distinguish **stale** from **cleanup candidate** in user-facing output. A stale worktree is one that is safe to propose for cleanup.

## Cleanup

When the user asks to clean up or remove worktrees:

1. Run a survey first (which prunes stale entries).
2. Collect stale worktrees.
3. List them and confirm with the user before removing. Include ahead counts for merged or closed PR worktrees as context, but do not exclude them solely because they are ahead of `main`.

## Output

Match the output to the intent:

- **Find** — one entry: path, branch, status, and any linked dev-note.
- **Survey** — terse table, one row per non-main worktree:

  ```
  vitest-pr-10466    active       "Fix snapshot serializer"   clean, 2 ahead
  vitest-issue-9812  active       fix/issue-9812              3 files dirty
  vitest-wt4         stale        vitest-wt4                  same as main
  ```

  After the table, list any worktrees whose names don't follow the convention as **unnamed**.

- **Create / Clean** — confirm the action taken or the proposed commands.
