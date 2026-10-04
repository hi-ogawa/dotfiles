---
name: ho-worktrees
description: >-
  Conventions for worktree-related workflows. Use when the user invokes "ho-wt" or "ho-worktrees", before changing code in a repository for work that goes through a branch or pull request, or when checking out a pull request locally for review or testing.
---

# Worktrees

## Purpose

Answer worktree-related questions and take worktree-related actions by reading git state and GitHub context. Infer intent from the request.

Common intents:

- **Create** — "worktree for pr 10466", "new worktree for issue 9812" → create following the naming convention.
- **Find** — "where was I on the snapshot issue", "which worktree has pr 10466" → locate and describe the one relevant worktree.
- **Clean** — "remove stale ones", "clean up" → read `references/status-and-cleanup.md`, identify candidates, and confirm before removing.

When this skill triggers without an explicit invocation, apply only the main worktree check and Create, so the worktree exists before the first code change. Find and Clean run only on request. Repositories whose convention is committing directly to `main` are out of scope.

## Naming Convention

Worktree directories live as siblings of the main worktree:

```
<repo>                        # main worktree
<repo>-pr-<NNNN>-<slug>       # reviewing or working on a pull request
<repo>-issue-<NNNN>-<slug>    # fix branch after triage of an issue
<repo>-<slug>                 # topic with no issue/PR anchor
```

Choose a concise slug that reflects the worktree's purpose. Infer it case by case from the broader issue or PR context rather than mechanically deriving it from the title.

## Main Worktree

The main worktree always stays on the latest `main`. Branch work happens only in sibling worktrees. "Latest" means the remote branch that `main` tracks (`main@{upstream}`), which is `upstream/main` rather than `origin/main` in fork setups. If `main` has no upstream configured, report it instead of guessing a remote.

Before creating a worktree, check the main worktree:

- **On `main`**: run `git pull --ff-only`, so new branches start from the latest `main`.
- **On another branch with a clean tree**: note the branch, run `git switch main` and `git pull --ff-only`, then move the branch into its own sibling worktree with `git worktree add ../<repo>-<...> <branch>`, named by what the branch is for.
- **Dirty tree**: stop and ask. Do not stash.
- **Fast-forward fails**: stop and report the divergence. Do not reset.

After noticing a merge into `main`, such as a PR you merged or saw land, fast-forward the main worktree the same way when it is on `main` and clean, and mention it, because the user may run tools or apps from it.

## Creation

Determine the type from context:

- **PR**: First check whether the PR branch is already checked out in a sibling worktree. If so, reuse that worktree regardless of its directory name. If it is checked out in the main worktree, apply the main worktree check first. Otherwise, create the worktree with `git worktree add --detach ../<repo>-pr-<N>-<slug>`. Then run `gh pr checkout <N>` as a separate command with its working directory set to `../<repo>-pr-<N>-<slug>`. Never run `gh pr checkout` in the main worktree.
- **Issue fix**: `git worktree add ../<repo>-issue-<N>-<slug> -b fix/issue-<N>`.
- **Topic**: `git worktree add ../<repo>-<slug> -b <slug>`.

Install dependencies normally in new worktrees when required.
