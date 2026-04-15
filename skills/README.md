# Personal Agent Skills

Custom skills following the [Agent Skills](https://agentskills.io) open standard. Each skill is a directory with a `SKILL.md` entrypoint.

## Adding a new skill

Create `<skill-name>/SKILL.md` in this directory.

## Setup

### skills CLI (recommended)

[`skills`](https://github.com/vercel-labs/skills) auto-detects installed agents and symlinks skills to all of them:

```bash
pnpm dlx skills add ./skills --all -g --agent codex claude-code
```

### Claude Code

Symlink into `~/.claude/skills/` for global discovery one by one:

```bash
mkdir -p ~/.claude/skills
ln -snrf ./skills/dev-notes ~/.claude/skills/dev-notes
```

All at once:

```bash
mkdir -p ~/.claude/skills
for skill in ./skills/*/; do
  ln -snrf "$skill" ~/.claude/skills/$(basename "$skill")
done
```

### Codex CLI

Symlink into `~/.codex/skills/` the same way:

```bash
mkdir -p ~/.codex/skills
for skill in ./skills/*/; do
  ln -snrf "$skill" ~/.codex/skills/$(basename "$skill")
done
```

Use `/skills` or `$` to mention a skill in conversation. Disable a skill without deleting it via `[[skills.config]]` in `~/.codex/config.toml`. See [Codex skills docs](https://developers.openai.com/codex/skills).

### skill-creator

Anthropic's [skill-creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator) helps Claude write and iterate on skills. It's bundled in the `example-skills` plugin (12 skills total — can't install individually).

```bash
# add anthropics/skills repo as marketplace (registers as "anthropic-agent-skills")
claude plugin marketplace add anthropics/skills

# install the plugin containing skill-creator
claude plugin install example-skills@anthropic-agent-skills
```

#### Side note: Claude Code plugin system

Plugins are the other way to install skills (besides symlinks). The layering:

```
marketplace                          ← a GitHub repo with .claude-plugin/marketplace.json
└── plugin                           ← installable unit (smallest thing `claude plugin install` operates on)
    └── skill                        ← individual SKILL.md directory
```

Any GitHub repo can be a marketplace. The marketplace name comes from the `name` field in `.claude-plugin/marketplace.json`.

Example: https://github.com/anthropics/skills/blob/main/.claude-plugin/marketplace.json
