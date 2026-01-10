# TODO

Remaining tasks for dotfiles consolidation.

## sync.sh Verification

- [x] Test `apply` command on Linux
- [x] Test `save` command on Linux
- [ ] Test `diff` command on Windows
- [ ] Test `apply` command on Windows
- [ ] Test `save` command on Windows

## Misc

- [ ] chore: archive old repo https://github.com/hi-ogawa/config
- [ ] Consider restructuring to shared + platform-specific (e.g., `git/.gitconfig` + `git/.gitconfig.windows`)
- [ ] research pnpm auto completion
- [ ] switch from `code-insiders` to `code`
- [ ] `gt c` (graphite cli) and `brgc` like utility
- [ ] `.gitignore-global` on windows (not `.gitignore_global`)

## Completed

- [x] Unify claude config across platforms (moved to top-level `claude/`)
- [x] Add notification hooks
- [x] Slim down permissions
- [x] Test `diff` command on Linux
- [x] Unify vscode config across platforms (moved to top-level `vscode/`)
- [x] Linux Bash Config Review (consolidated to single `.bashrc`)
- [x] Linux Git Config Review (kept: co-lg, co-co, sfpl, fco, difftool, SSH signing)
