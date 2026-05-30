---
name: ho-worktree
description: 'Create a new git worktree following the personal convention (sibling dir, basename == branch name, branched from main). Use only when the user explicitly invokes $ho-worktree.'
---

# ho-worktree Convention

Codifies the personal convention for spinning up an isolated worktree to do focused work — PR review, issue triage, experiments — without disturbing the primary checkout.

## Activation

Use this skill only when the user explicitly invokes `$ho-worktree` (or an obvious variant like `/ho-worktree`). Do not auto-trigger on prompts that merely mention worktrees, PRs, or branches.

After setup, the skill **does not** invoke any downstream skill. The user's next message (or the rest of the same prompt) drives what happens inside the new worktree.

## The Convention

Two load-bearing rules:

1. **Worktree directory basename == branch name.** This is required for `git snd` (see `.gitconfig`) to correctly identify the per-worktree branch via `basename($PWD)`. Never create a worktree whose dir name differs from its branch name.
2. **Branch is created from `main`.** Default starting point is the primary repo's `main` (matching `snd`'s refresh semantics). Any PR-head or branch-tip checkout happens *after* the worktree is created, by resetting the worktree's own branch.

Also:

- Worktree path is **a sibling of the primary worktree**, not of cwd. Resolve via `git worktree list | head -1`. This matters when invoked from inside another linked worktree.
- `<repo>` is the basename of the primary worktree, not cwd.

## Naming

Pattern: `<repo>-wt-<short-title>`

Short-title source precedence:

1. PR title, if a PR number/URL is in context.
2. Issue title, if an issue number/URL is in context.
3. User's free-text description in the prompt.
4. Fallback: `wt` (so the dir becomes `<repo>-wt-wt`, signaling missing context — prefer to ask the user instead).

Slugify: lowercase, kebab-case, strip stopwords (`the`, `a`, `for`, `to`, `in`), cap at ~30 chars. Keep it human-readable — the basename will be the branch name and show up in `ls`, `git branch`, and `git worktree list`.

## Collision

If `<repo>-wt-<title>` already exists (dir or branch), append `-2`, `-3`, etc. Never reuse or overwrite an existing worktree.

## Steps

Always:

```bash
primary=$(git worktree list | head -1 | awk '{print $1}')
repo=$(basename "$primary")
title=<slugified short title>
name="${repo}-wt-${title}"   # apply collision suffix if needed
path="$(dirname "$primary")/${name}"

# Make sure main is fresh before branching from it
git -C "$primary" fetch --no-tags origin main
git worktree add "$path" -b "$name" origin/main
```

Then, depending on intent:

### PR review

Land the PR's HEAD on the worktree's own branch (preserves basename == branch):

```bash
cd "$path"
git fetch origin "pull/<N>/head"
git reset --hard FETCH_HEAD
```

This keeps `git snd` working: the branch is still named `<repo>-wt-<title>`, only its tip moved to the PR head.

### Issue triage / experiment

Stop after `git worktree add`. The branch sits at `origin/main`, ready for reproduction work.

### Other branch

If the user names a specific upstream branch to start from:

```bash
cd "$path"
git fetch origin "<branch>"
git reset --hard "origin/<branch>"
```

## Inferring Intent

- PR number, PR URL, or "review …" in context → PR review mode.
- Issue number, issue URL, or "repro …", "triage …", "investigate …" → triage mode.
- Bare `$worktree <free text>` with no PR/issue signal → experiment mode (stop after `worktree add`).

If ambiguous (e.g. a GitHub URL that could be either), ask once before creating.

## After Setup

Report back:

- The new worktree path.
- The branch name.
- What the branch points at (e.g. `origin/main`, or `pull/123/head`).
- A one-line reminder that subsequent work runs in the new path until the user says otherwise.

Do not `cd` back to the primary worktree implicitly. Do not invoke a downstream skill — the user drives that.

## Out of Scope

- Cleanup. `git worktree remove` is user-driven; leaving worktrees around is the expected steady state (matches existing `<repo>-wt1`, `<repo>-wt2` siblings under `~/code/personal/`).
- Pushing the new branch. The branch is local; the user decides if and when to publish.
- Any mutation of the primary worktree beyond `git fetch`.
