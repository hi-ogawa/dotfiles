# TODO

Remaining tasks for dotfiles consolidation.

## sync.sh Verification

- [ ] Test `apply` command on Linux
- [ ] Test `save` command on Linux
- [ ] Test `diff` command on Windows
- [ ] Test `apply` command on Windows
- [ ] Test `save` command on Windows

## Linux Bash Config Review

The bash config has accumulated over time and likely contains stale content:

- [ ] Review `export.sh` - check if all exports are still needed
- [ ] Review `misc.sh` - identify unused utility functions
- [ ] Review `version-manager.sh` - which version managers are actually in use?
- [ ] Consider simplifying to match Windows minimal style

## Linux Git Config Review

- [ ] Review git aliases - identify unused ones
- [ ] Check if SSH signing setup is still current
- [ ] Compare with Windows config for potential consolidation

## VSCode Consolidation

- [ ] Compare linux/vscode/ vs windows/vscode/ - identify differences
- [ ] If minimal differences, move to shared top-level `vscode/`

## Low Priority

- [ ] Consider restructuring to shared + platform-specific (e.g., `git/.gitconfig` + `git/.gitconfig.windows`)

## Completed

- [x] Unify claude config across platforms (moved to top-level `claude/`)
- [x] Add notification hooks
- [x] Slim down permissions
- [x] Test `diff` command on Linux
