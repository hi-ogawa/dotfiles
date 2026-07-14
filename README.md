# dotfiles

Personal configuration files for Linux (Arch), Windows, and macOS.

## Usage

```bash
./sync.sh              # show help
./sync.sh status       # list files with diff state
./sync.sh diff         # show all differences
./sync.sh diff vscode  # show differences for vscode only
./sync.sh apply        # apply all configs to system
./sync.sh apply claude # apply only claude configs
./sync.sh save         # save all system configs to repo
```

## Configs

- [Shell](shell/)
- [Git](git/)
- [VSCode](vscode/)
- [Claude](claude/)
- [Codex](codex/)
- [OpenCode](opencode/)

## Agent Skills

Personal agent skills live under `skills/`. The sync script links them into `~/.agents/skills` and `~/.claude/skills`:

```bash
./sync-skills.sh
```

Run the script after adding a new skill. Existing linked skills do not need to be synced after edits because changes made through either path affect the same repository file. Restart the agent application after skill changes so it reloads them. If a skill is renamed or removed, clean up stale links manually.

See [skills/README.md](skills/README.md).

## Setup Guides

- [Linux](docs/linux-setup/README.md)
- [macOS](docs/macos-setup/README.md)
- [Windows](docs/windows-setup/README.md)

## Development

### Commit Style

Use scope-based commit subjects:

```text
<scope>: <summary>
```

Prefer the affected area as the scope, such as `shell`, `codex`, `git`, `skill`, `sync`, or `vscode`.
