---
name: local-repos
description: 'Use ~/code/ as a local repository library. Trigger only when the user explicitly writes "local-repos".'
---

This skill is for using `~/code/` as a local library of repositories after the user has explicitly opted in with `local-repos`.

The two main directories:

- **`~/code/others/`** — cloned external / open-source repos (200+). The primary reference source — check here first.
- **`~/code/personal/`** — the user's own projects. Use only when the user asks for prior personal patterns or the task clearly depends on another named personal repo.

## Finding the right repo

With hundreds of repos, efficient discovery matters:

1. **Guess the name first** — most repos use their canonical name (e.g., `vitest`, `rolldown`, `react-router`). Try `ls ~/code/others/<name>` directly.
2. **Glob for partial matches** — `ls ~/code/others/*vite*` or `ls ~/code/others/*rsc*`.
3. **Grep across repos** — when looking for a specific API or pattern, grep across repo directories rather than reading each one.
4. **Check `personal/`** for the user's own prior patterns — rare but valuable for "how did I do X before?" questions.

## Usage

- **Browse existing repos first** — check what's already cloned before fetching anything new
- **Never clone without asking** — if a repo isn't there, ask the user before cloning. Confirm the exact repo URL — don't guess or construct URLs from memory, as they may not exist.
- **Shallow clone** — when cloning is approved, use `git clone --depth=1` unless full history is needed
- **Read-only** — never commit or modify files in any `~/code/` repo from another project's context

## When to use

- The user explicitly writes `local-repos`
