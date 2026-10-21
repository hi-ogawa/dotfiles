---
name: ho-worktrees
description: >-
  Conventions for worktree-related workflows. Use when the user invokes "ho-wt" or "ho-worktrees", before changing code in a repository for work that goes through a branch or pull request, or when checking out a pull request locally for review or testing.
---

# Worktrees

Branch work happens in sibling worktrees. The main worktree stays on the latest `main`, so the user can run tools and apps from it. Repositories whose convention is committing directly to `main` are out of scope.

## Naming

```
<repo>                        # main worktree
<repo>-pr-<NNNN>-<slug>       # reviewing or working on a pull request
<repo>-issue-<NNNN>-<slug>    # fixing an issue
<repo>-<slug>                 # topic with no issue or PR
```

Choose a concise slug that reflects the work. Infer it from the broader issue or PR context rather than deriving it mechanically from the title.

## Starting or continuing work

A worktree belongs to the work it was created for. To continue work, such as a PR you are asked to review or change, use the worktree that already has its branch checked out, whatever its directory name.

For new work, run the main worktree check, then create a worktree. If the branch or directory name already exists, it belongs to other work, so pick a different slug, or ask when the name is fixed, as with `fix/issue-<N>`.

- **PR**: `git worktree add --detach ../<repo>-pr-<N>-<slug>`, then `gh pr checkout <N>` as a separate command run in that worktree. Never run `gh pr checkout` in the main worktree.
- **Issue fix**: `git worktree add ../<repo>-issue-<N>-<slug> -b fix/issue-<N>`.
- **Topic**: `git worktree add ../<repo>-<slug> -b <slug>`.

Install dependencies in a new worktree when the work needs them.

## Main worktree check

"Latest `main`" means the branch `main` tracks (`main@{upstream}`), which is `upstream/main` rather than `origin/main` in fork setups. If `main` has no upstream, report it instead of guessing a remote.

- **On `main`**: run `git pull --ff-only`.
- **On another branch with a clean tree**: run `git switch main` and `git pull --ff-only`, then move the branch into its own sibling worktree with `git worktree add ../<repo>-<...> <branch>`, named by what the branch is for.
- **Dirty tree**: stop and ask. Do not stash.
- **Fast-forward fails**: stop and report the divergence. Do not reset.

## After a merge

When a PR lands in `main`, fast-forward the main worktree if it is on `main` and clean, and mention it. After merging a PR at the user's request, also remove its worktree and local branch if the worktree is clean, and mention it. The merge settles what the worktree was for, so this needs no confirmation.

## On request

- **Find**: "where was I on the snapshot issue", "which worktree has pr 10466". Locate and describe the one relevant worktree.
- **Clean**: "remove stale ones", "clean up". Follow `references/status-and-cleanup.md`, and confirm before removing anything.
