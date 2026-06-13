# Development Environment

## Package Managers: winget vs scoop

**scoop https://scoop.sh for CLI dev tools** (Preferred)

- No admin needed, no terminal restart
- User-local install (`~/scoop/apps/`)
- e.g. `scoop install gh yazi jq ripgrep fd`

**winget for GUI apps**

- Official Microsoft tool (pre-installed)
- System-wide install, often needs admin
- e.g. `winget install Git.Git Microsoft.VisualStudioCode Google.Chrome`

## Git for Windows Components

`winget install Git.Git` installs:

- `git.exe` - Added to Windows PATH, works everywhere
- Git Bash - Separate shell app with Unix tools (bash, vim, grep, ssh, etc.)
- Unix tools in `C:\Program Files\Git\usr\bin\` - Only work inside Git Bash

**Key point:** Only git.exe is in PATH. Unix commands only work in Git Bash shell, not PowerShell.

## Shell Environment (PowerShell vs Git Bash)

**PowerShell** (Windows native)

- Default in VSCode/Windows Terminal
- Has some Unix aliases (`ls`, `cd`, `cp`) but they're PowerShell cmdlets
- Missing: `which`, `rm`, `grep`, `vim`

**Git Bash** (Unix-like)

- Launch from Start menu or VSCode terminal dropdown
- Full Unix tools available
- Path translation: `C:\Users\` ↔ `/c/Users/`

**Claude Code uses Git Bash** for the Bash tool.

## Shell Decision for Development

**Use WSL.** Git Bash has ~100ms overhead per command (process creation) which makes interactive shell work painfully slow. See [dev-wsl.md](dev-wsl.md) for setup and benchmarks.

## Git Configuration

See [dev-git.md](dev-git.md) and [.gitconfig](https://github.com/hi-ogawa/dotfiles/blob/main/.gitconfig)
