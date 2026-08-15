# Status And Cleanup

## Status Query

Prune first (`git worktree prune`) to clear stale entries from manually deleted directories.

Gather what's needed to classify each non-main worktree:

- **Type** — inferred from directory name (pr/issue/topic).
- **Git state** — dirty, commits ahead of main.
- **PR state** — check every worktree branch for an associated PR via `gh`, regardless of whether the worktree path is PR-shaped. Use a PR number from a PR-shaped path as an additional lookup hint, not as the condition for checking PR state.

When matching worktree branches to PRs, include open, merged, and closed PRs. If multiple PRs use the same branch name, prefer an open PR or one whose head commit matches the worktree; otherwise report the ambiguity instead of guessing.

Classification:

- **active** — dirty, has unexplained local commits, or belongs to an open PR.
- **stale** — clean and either belongs to a merged or closed PR, or has no commits ahead of `main` and does not belong to an open PR. Both merged and closed PR worktrees are cleanup targets by default. Ahead commits do not prevent a merged or closed PR worktree from being stale because squash and rebase merges commonly leave commits unreachable from `main`.

## Cleanup

When the user asks to clean up or remove worktrees:

1. Run a status query first, which also prunes stale entries.
2. Collect stale worktrees.
3. List them in a table with statuses and confirm with the user before removing.
