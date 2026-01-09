# dotfiles

Personal configuration files for Linux (Arch) and Windows.

## Usage

```bash
./sync.sh              # show differences (auto-detect platform)
./sync.sh apply        # apply configs to system
./sync.sh save         # save system configs back to repo
```

## Structure

```
linux/      # Arch Linux configs (bash, git, vscode, claude)
windows/    # Windows configs (bash, git, vscode, claude)
docs/       # Setup guides
```

## Setup Guides

- [Arch Linux](docs/setup-archlinux.md)
- [Windows](docs/setup-windows.md)
