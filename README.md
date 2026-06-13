# dotfiles

Personal configuration files for Linux (Arch) and Windows.

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

- [Bash](bash/)
- [Git](git/)
- [VSCode](vscode/)
- [Claude](claude/)
- [Codex](codex/)
- [OpenCode](opencode/)

## Commit Style

Use scope-based commit subjects:

```text
<scope>: <summary>
```

Prefer the affected area as the scope, such as `bash`, `codex`, `git`, `skill`, `sync`, or `vscode`.

## Agent Skills

Personal agent skills live under `skills/`. After editing skills, sync them into the local agent skill directories:

```bash
./sync-skills.sh
```

See [skills/README.md](skills/README.md).

## Setup Guides

- [Linux](docs/linux-setup/README.md)
- [Windows](docs/windows-setup/README.md)
