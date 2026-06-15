# macOS Setup

## Desktop Ergonomics

The goal is not to make macOS behave exactly like GNOME. Carry over the small baseline that removes daily friction.

- Enable tap-to-click: System Settings > Trackpad > Tap to click.
- Use short key repeat delay and fast repeat.
- Swap Caps Lock and Control: System Settings > Keyboard > Keyboard Shortcuts > Modifier Keys.
- Use a familiar monospace font, such as Roboto Mono, in the terminal and editor.

Useful `defaults` equivalents:

```sh
# tap to click
defaults write com.apple.AppleMultitouchTrackpad Clicking -bool true
defaults write com.apple.driver.AppleBluetoothMultitouch.trackpad Clicking -bool true

# key repeat
defaults write -g InitialKeyRepeat -int 15
defaults write -g KeyRepeat -int 2
```

## Control vs Command

macOS splits what Linux/Windows usually put on Control into two layers:

- Command is for GUI/app/menu shortcuts, such as copy, paste, find, save, and new tab.
- Control is for terminal control characters, such as interrupt, EOF, and reverse search.

Useful mental model: if it is a visible app menu action, try Command. If it is terminal line editing or sends a control character, try Control.

Common shortcuts:

- `Cmd+Tab`: switch apps.
- `` Cmd+` ``: switch windows within the current app.
- `Cmd+W`: close current window/tab.
- `Cmd+Q`: quit the app.
- `Ctrl+Cmd+Q`: lock screen.
- `Ctrl+Cmd+F`: fullscreen, which may create a separate Space.

## Window Management

macOS fullscreen is not the same as GNOME/Windows maximize. For fill-screen and move-to-display shortcuts, use Rectangle.

Common Rectangle shortcuts:

- `Ctrl+Option+Enter`: maximize/fill screen.
- `Ctrl+Option+Left`: left half.
- `Ctrl+Option+Right`: right half.
- `Ctrl+Option+Cmd+Right`: move to next display.
- `Ctrl+Option+Cmd+Left`: move to previous display.

## Dotfiles

`sync.sh` detects macOS and rewrites VS Code settings to the macOS user settings path. It also skips the Linux-only systemd service for OpenCode.

During early setup, prefer narrow filters until the full macOS list has been used in practice.

```sh
./sync.sh apply .zshrc
```

Current macOS shell setup is `shell/.zshrc`.

## Homebrew

Install Homebrew from https://brew.sh/ and make sure it is on `PATH`.

For Apple Silicon Macs, the usual bootstrap line is:

```sh
eval "$(/opt/homebrew/bin/brew shellenv)"
```

The managed `.zshrc` handles both Apple Silicon macOS Homebrew and Linux Homebrew paths.

## Apps And Tools

Install GUI apps with Homebrew Cask where practical:

```sh
brew install --cask google-chrome
brew install --cask visual-studio-code
brew install --cask ghostty
brew install --cask rectangle
```

Install CLI basics:

```sh
brew install git gh jq htop yazi nnn bash
```

After installing VS Code, enable the `code` CLI from the Command Palette: `Shell Command: Install 'code' command in PATH`.
