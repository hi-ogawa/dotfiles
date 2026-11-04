# Status And Cleanup

## Status Query

Prune first (`git worktree prune`) to clear stale entries from manually deleted directories.

Report the main worktree on its own line: its branch, and how far it is behind `main@{upstream}` after fetching that remote. Flag it when it is not on `main`.

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
3. Remove the stale worktrees and their local branches. If the main worktree is on `main` and clean, fast-forward it.
4. Report what was removed in a table with statuses. Ask about anything left in place: a worktree that couldn't be classified with confidence, such as a branch matching several PRs, and a main worktree that is on another branch or dirty.
5. Prune VS Code's Open Recent list as described in the next section.

## VS Code Open Recent List

VS Code's Open Recent list keeps removed worktrees, because VS Code never drops missing folders by itself. VS Code holds the list in memory and writes it back on its next change, so an edit made while VS Code is open is lost. The script below refuses to run in that case.

1. Run `<skill-dir>/scripts/vscode-prune-recent.py --dry-run` to list the entries that point to missing paths. If there are none, stop.
2. Run `<skill-dir>/scripts/vscode-prune-recent.py` to remove them. It saves a backup next to the database.
3. If it reports that VS Code is running, do not quit VS Code. Give the user the command to run after quitting VS Code.
4. Report how many entries were removed, or how many are waiting for the user's run.
