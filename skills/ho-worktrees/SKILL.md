---
name: ho-worktrees
description: >-
  Conventions for worktree-related workflows. Use when the user invokes "ho-wt" or "ho-worktrees", before changing code in a repository for work that goes through a branch or pull request, before starting another session that will do such work, or when checking out a pull request locally for review or testing.
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

Get a worktree for the work before changing code:

- **The work already has a worktree**, such as a PR you are asked to review or change: use the worktree that has its branch checked out, whatever its directory name.
- **The worktree is behind its PR**: run `gh pr checkout <N>` in the worktree, which fast-forwards its branch. If the PR's branch was force-pushed, the command refuses because the branch cannot fast-forward. Then check that the worktree is clean and that the old branch has no commits of the user's, and stop and report if either check fails. Otherwise run `gh pr checkout <N> --force`, which resets the branch to the PR's head. When the old head is still useful, such as for comparing a reviewed PR before and after, save it first with `git branch <branch>-<MMDD> <branch>`. Do not leave a PR worktree on a detached HEAD, because editors and `gh` find the PR through the upstream of the checked-out branch.
- **Otherwise**: run the main worktree check, then create one with the commands below. If the branch or directory name you would use already exists, stop and report it, because it may be earlier work or another session's work.

Create commands:

- **PR**: `git worktree add --detach ../<repo>-pr-<N>-<slug>`, then `gh pr checkout <N>` as a separate command run in that worktree. Never run `gh pr checkout` in the main worktree.
- **Issue fix**: `git worktree add ../<repo>-issue-<N>-<slug> -b fix/issue-<N>`.
- **Topic**: `git worktree add ../<repo>-<slug> -b <slug>`.

Install dependencies in a new worktree when the work needs them.

## Starting another session

When starting another session for branch work, start it in the main worktree, not in a worktree that the tool creates for it, and have its brief load this skill before it changes anything. The session then creates or reuses its worktree by these conventions. A session started in a tool-created worktree treats that one as its existing worktree and never applies them.

## Main worktree check

"Latest `main`" means the branch `main` tracks (`main@{upstream}`), which is `upstream/main` rather than `origin/main` in fork setups. If `main` has no upstream, report it instead of guessing a remote. If `main` tracks `origin/main` while an `upstream` remote exists, report it instead of pulling from the fork.

- **On `main`**: run `git pull --ff-only`. In a fork setup, then run `git push origin main` to keep the fork's `main` current.
- **On another branch, or a dirty tree**: stop and report it. Do not switch or stash.
- **Fast-forward or push fails**: stop and report the divergence. Do not reset or force push.

## After a merge or close

When a PR lands in `main`, fast-forward the main worktree if it is on `main` and clean. When a PR the session worked on is merged or closed, also remove its worktree and local branch if the worktree is clean, even when the session runs inside it. Merging or closing settles what the worktree was for, so this needs no confirmation.

## Cleanup

When the user asks to clean up worktrees, follow `references/status-and-cleanup.md`. The request itself is the confirmation, so stale worktrees are removed directly, and only ambiguous ones are asked about.
