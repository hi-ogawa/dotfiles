---
name: ho-worktrees
description: >-
  Conventions for worktree-related workflows. Use only when the user explicitly invokes "ho-wt" or "ho-worktrees".
---

# Worktrees

## Purpose

Answer worktree-related questions and take worktree-related actions by reading git state and GitHub context. Infer intent from the request.

Common intents:

- **Create** — "worktree for pr 10466", "new worktree for issue 9812" → create following the naming convention.
- **Find** — "where was I on the snapshot issue", "which worktree has pr 10466" → locate and describe the one relevant worktree.
- **Clean** — "remove stale ones", "clean up" → read `references/status-and-cleanup.md`, identify candidates, and confirm before removing.

## Naming Convention

Worktree directories live as siblings of the main worktree:

```
<repo>                          # main worktree
<repo>-pr-<NNNN>-<slug>       # reviewing or working on a pull request
<repo>-issue-<NNNN>-<slug>    # fix branch after triage of an issue
<repo>-<slug>                   # topic with no issue/PR anchor
```

Choose a concise slug that reflects the worktree's purpose. Infer it case by case from the broader issue or PR context rather than mechanically deriving it from the title.

## Creation

Determine the type from context:

- **PR**: First check whether the PR branch is already checked out in a local worktree. If so, reuse that worktree regardless of its directory name. Otherwise, create the worktree with `git worktree add --detach ../<repo>-pr-<N>-<slug>`. Then run `gh pr checkout <N>` as a separate command with its working directory set to `../<repo>-pr-<N>-<slug>`. Run `gh pr checkout` only from the target worktree so the main worktree remains on its current branch.
- **Issue fix**: `git worktree add ../<repo>-issue-<N>-<slug> -b fix/issue-<N>`.
- **Topic**: `git worktree add ../<repo>-<slug> -b <slug>`.

Always base new worktrees off the current main branch tip.
