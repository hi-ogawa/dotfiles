---
name: reference-repos
description: Use ~/code/ as a library of local repos for reference. Use when investigating how other projects solve a problem, checking upstream dependency internals, reusing patterns from prior work.
---

`~/code/` is a local library of repositories. The two main directories:

- **`~/code/others/`** — cloned external / open-source repos (200+). The primary reference source — check here first.
- **`~/code/personal/`** — the user's own projects.

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

- User says "check how X does it" or "look at Y's implementation"
- You need to understand an upstream dependency's internals
- Comparing approaches across projects
- Any time reading source is more reliable than docs
