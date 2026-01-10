# dotfiles

Personal configuration files for Linux (Arch) and Windows.

## Usage

```bash
./sync.sh              # show help
./sync.sh diff         # show all differences
./sync.sh diff vscode  # show differences for vscode only
./sync.sh apply        # apply all configs to system
./sync.sh apply claude # apply only claude configs
./sync.sh save         # save all system configs to repo
```

## Structure

```
claude/     # shared (cross-platform)
vscode/     # shared (cross-platform)
linux/      # Arch Linux configs (bash, git)
windows/    # Windows configs (bash, git, wezterm)
docs/       # Setup guides
```

## Setup Guides

- [Arch Linux](docs/setup-archlinux.md)
- [Windows](docs/setup-windows.md)
