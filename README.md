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

Personal agent skills live under `skills/`. After editing skills, sync them into the local agent skill directories:

```bash
./sync-skills.sh
```

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
