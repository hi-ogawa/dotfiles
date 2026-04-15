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

## Codex

Use `$skill-name` or `/skills` to mention a skill. See https://developers.openai.com/codex/skills
