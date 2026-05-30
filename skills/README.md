# Personal Agent Skills

Custom agent skills following the [Agent Skills](https://agentskills.io) open standard. Each skill is a directory with a `SKILL.md` entrypoint.

## Setup

Install or refresh the skills after editing this repo:

```sh
./sync-skills.sh
```

This delegates to the [`skills`](https://github.com/vercel-labs/skills) CLI and it requires rerun after local edits.

## Authoring Skills

Install `skill-creator` before creating or updating skills so agents can use the canonical authoring guidance:

```sh
pnpm dlx skills add https://github.com/anthropics/skills --skill skill-creator -y -g -a '*'
```

Then ask the agent to use `skill-creator` when creating or editing a skill.

Create local skills under `<skill-name>/SKILL.md` in this directory.

## Naming Convention

New skills use the `ho-` prefix (e.g. `ho-worktree`). Bare names risk silent collision with built-in Claude Code skills introduced by updates — when a built-in shadows a personal skill, it stops being invoked with no warning ([anthropics/claude-code#33080](https://github.com/anthropics/claude-code/issues/33080)). The `ho-` prefix matches the convention already used for personal shell functions in [.bashrc](../.bashrc) (`ho_english`, `ho_swap_reset`, etc.) and serves as a self-namespace until Claude Code adopts proper user-level namespacing ([RFC #43695](https://github.com/anthropics/claude-code/issues/43695)).

Pre-existing skills (`dev-notes`, `review-diff`, `local-repos`) are left bare for now; rename if a collision actually bites.

## Codex

Use `$skill-name` or `/skills` to mention a skill. See https://developers.openai.com/codex/skills
