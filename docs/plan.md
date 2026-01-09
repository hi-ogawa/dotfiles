# Dotfiles Consolidation Plan

Merge configs from `config/` (Linux) and `windows-setup/` (Windows) into a unified, minimal dotfiles repository.

## Proposed Structure

```
dotfiles/
├── README.md
├── CLAUDE.md
├── sync.sh                     # diff/apply/save (like windows-setup)
│
├── linux/
│   ├── bash/
│   │   ├── .bashrc
│   │   └── ...                  # (needs review)
│   ├── git/
│   │   ├── .gitconfig
│   │   └── .gitignore-global
│   ├── vscode/
│   │   ├── settings.json
│   │   └── keybindings.json
│   └── claude/
│       └── settings.json
│
├── windows/
│   ├── .bash_profile
│   ├── .bashrc
│   ├── .gitconfig
│   ├── .gitignore_global
│   ├── vscode/
│   │   ├── settings.json
│   │   └── keybindings.json
│   └── claude/
│       └── settings.json
│
└── docs/
    ├── setup-archlinux.md       # Arch setup guide
    └── setup-windows.md         # Windows setup guide
```

## Design Decisions

| Aspect | Approach |
|--------|----------|
| Platform separation | `linux/` and `windows/` directories (no merging) |
| Installation | Copy-based `sync.sh` with diff/apply/save |
| No symlinks | Copies only (simpler, works everywhere) |
| No build tooling | No Makefile, no CI |

## sync.sh Interface

```bash
./sync.sh [command] [platform]

# Commands
  diff      Show differences between repo and system (default)
  apply     Copy configs from repo to system
  save      Copy configs from system back to repo

# Platform
  linux     (default on Linux)
  windows   (default on MINGW/MSYS)

# Examples
./sync.sh                    # diff for current platform
./sync.sh apply              # apply for current platform
./sync.sh save linux         # save Linux configs back to repo
```

## Implementation Steps

### Phase 1: Setup Structure

- [ ] Create directory structure (linux/, windows/, docs/)
- [ ] Write sync.sh with diff/apply/save commands
- [ ] Create README.md and CLAUDE.md

### Phase 2: Migrate Windows Configs

- [ ] Copy windows-setup/dotfiles/* to windows/
- [ ] Verify sync.sh works on Windows

### Phase 3: Migrate Linux Configs

- [ ] Copy git config to linux/git/
- [ ] Copy vscode config to linux/vscode/
- [ ] Copy claude config to linux/claude/
- [ ] **Review and simplify bash config** (see follow-up below)

### Phase 4: Documentation

- [ ] Create docs/setup-archlinux.md (brief, link to config/ for full history)
- [ ] Create docs/setup-windows.md (brief, link to windows-setup/ for full history)

### Feedback

- sync.sh
  - should default to help not `diff`
  - move platform constant to top level instead of inside branches
  - improve diff header
  - apply/save selectively and interactively
  - log detected platform

## Follow-up

### Linux Bash Config Review

The current Linux bash config in `config/bash/` has accumulated over time and likely contains stale content:

- [ ] Review `export.sh` - check if all exports are still needed
- [ ] Review `misc.sh` - identify unused utility functions
- [ ] Review `version-manager.sh` - which version managers are actually in use?
- [ ] Consider simplifying to match Windows minimal style
- [ ] Remove unused completions setup

### Linux Git Config Review

- [ ] Review git aliases - identify unused ones
- [ ] Check if SSH signing setup is still current
- [ ] Compare with Windows config for potential consolidation

### Platform-Independent Configs

VSCode and Claude configs may be platform-independent and could be consolidated:

- [ ] Compare linux/vscode/ vs windows/vscode/ - identify differences
- [ ] Compare linux/claude/ vs windows/claude/ - identify differences
- [ ] If minimal differences, consider moving to shared top-level vscode/ and claude/

References:
- https://github.com/hi-ogawa/config
- https://github.com/hi-ogawa/windows-setup
- https://gist.github.com/hi-ogawa/a873d9406f580dfdf1e391a427a4dd0b

## Files to Migrate

### From windows-setup/dotfiles/

| Source | Destination |
|--------|-------------|
| .bash_profile | windows/.bash_profile |
| .bashrc | windows/.bashrc |
| .gitconfig | windows/.gitconfig |
| .gitignore_global | windows/.gitignore_global |
| vscode/settings.json | windows/vscode/settings.json |
| vscode/keybindings.json | windows/vscode/keybindings.json |
| claude/settings.json | windows/claude/settings.json |

### From config/

| Source | Destination | Notes |
|--------|-------------|-------|
| git/.gitconfig | linux/git/.gitconfig | |
| git/.gitignore-global | linux/git/.gitignore-global | |
| vscode/settings.json | linux/vscode/settings.json | |
| vscode/keybindings.json | linux/vscode/keybindings.json | |
| claude/settings.json | linux/claude/settings.json | |
| bash/* | linux/bash/* | **Needs review/cleanup** |

### Docs (link to originals)

| Source | Destination |
|--------|-------------|
| windows-setup/setup.md | docs/setup-windows.md (summarize + link) |
| windows-setup/notes/* | Link to original repo |
| config/README.md | docs/setup-archlinux.md (summarize + link) |
