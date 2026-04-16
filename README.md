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

## Setup Guides

- [Arch Linux](docs/setup-archlinux.md)
- [Windows](docs/setup-windows.md)

## References

- [Git configuration](https://git-scm.com/docs/git-config)
- [Global gitignore](https://git-scm.com/docs/gitignore)
- [VSCode settings](https://code.visualstudio.com/docs/getstarted/settings)
- [Claude Code settings](https://code.claude.com/docs/en/settings)
- [Codex configuration](https://developers.openai.com/codex/config-reference)
- [Codex hooks](https://developers.openai.com/codex/hooks)
- [OpenCode docs](https://opencode.ai/docs)
- [WezTerm config](https://wezterm.org/config/files.html)

## TODO

- remove wezterm
- use `ID+USERNAME@users.noreply.github.com` in gitconfig
  - https://docs.github.com/en/enterprise-cloud@latest/account-and-profile/reference/email-addresses-reference
  - https://docs.github.com/en/account-and-profile/how-tos/email-preferences/setting-your-commit-email-address
