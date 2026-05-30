# Personal Agent Skills

Custom agent skills following the [Agent Skills](https://agentskills.io) open standard. Each skill is a directory with a `SKILL.md` entrypoint.

## Usage

Create or update skills under `skills/<skill-name>/SKILL.md`, then sync them into the local agent skill directories:

```sh
./sync-skills.sh
```

Both Claude and Codex include built-in "skill creator" meta skill, so ask the agent itself to create or update skills here.

Use the `ho-` prefix for local personal skills so they stay clearly namespaced from built-in or third-party skills.

If a skill is renamed or removed, check the installed skill directories and clean up stale copies manually.

## Codex

Use `$skill-name` or `/skills` to mention a skill. See https://developers.openai.com/codex/skills
