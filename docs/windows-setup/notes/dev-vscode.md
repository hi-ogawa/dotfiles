# VSCode Setup (Windows)

Windows-specific VSCode configuration and best practices.

## Config File Locations

**Windows paths:**

- Settings: `%APPDATA%\Code\User\settings.json`
- Keybindings: `%APPDATA%\Code\User\keybindings.json`
- Extensions: `%USERPROFILE%\.vscode\extensions\`

## Settings

See **[vscode/settings.json](https://github.com/hi-ogawa/dotfiles/blob/main/vscode/settings.json)** and **[vscode/keybindings.json](https://github.com/hi-ogawa/dotfiles/blob/main/vscode/keybindings.json)**

Key settings:

- Force LF line endings for Git compatibility
- Git Bash as default terminal
- Shift+Enter for terminal escape sequence

## Notes

**Windows Defender performance:**
Can slow file watching. Consider exclusions:

- Code directory: `C:\Users\<user>\code\`
- VSCode: `C:\Program Files\Microsoft VS Code\`
- npm: `%APPDATA%\npm\`

**Line continuation in terminal:**

- Git Bash: `\`
- PowerShell: `` ` ``
