# macOS Setup

## Desktop Ergonomics

The goal is not to make macOS behave exactly like GNOME. Carry over the small baseline that removes daily friction.

- Enable tap-to-click: System Settings > Trackpad > Tap to click.
- Use short key repeat delay and fast repeat: System Settings > Keyboard > Key repeat rate / Delay until repeat.
- Swap Caps Lock and Control: System Settings > Keyboard > Keyboard Shortcuts > Modifier Keys.
- Disable the `Ctrl+Space` / `Ctrl+Option+Space` input-source combos under System Settings > Keyboard > Keyboard Shortcuts > Input Sources, freeing those Control combinations for app shortcuts (e.g. editor autocomplete). The Globe (🌐) key still switches input sources.

## Dotfiles

`sync.sh` detects macOS and rewrites VS Code settings to the macOS user settings path.

During early setup, prefer narrow filters until the full macOS list has been used in practice.

```sh
./sync.sh apply .zshrc
```

Current macOS shell setup is `shell/.zshrc`.

## Homebrew

Install Homebrew from https://brew.sh/. The managed shell config handles the Homebrew `PATH` setup.

## Apps And Tools

Install GUI apps with [Homebrew Cask](https://docs.brew.sh/Cask-Cookbook) where practical:

```sh
brew install --cask google-chrome
brew install --cask visual-studio-code
brew install --cask ghostty
```

Install CLI basics:

```sh
brew install git gh jq htop yazi nnn bash
```

`git` and `bash` are built into macOS, but Homebrew provides newer, predictable versions for development.

After installing VS Code, enable the `code` CLI from the Command Palette: `Shell Command: Install 'code' command in PATH`.

## SSH And GitHub

Generate the default SSH key used for GitHub auth and SSH commit signing:

```sh
ssh-keygen -t ed25519 -C <email>
```

Authenticate `gh` and prefer SSH for Git remotes:

```sh
gh auth login --git-protocol ssh --web
```

Add the public key to GitHub:

- https://github.com/settings/keys

Verify:

```sh
ssh -T git@github.com
gh auth status
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

macOS fullscreen is not the same as GNOME/Windows maximize. `macos/ho-desktop` provides the two window operations used by this setup:

- `Ctrl+Option+Up`: maximize/fill screen.
- `Ctrl+Option+Right`: move to next display.

Install the executable and per-user LaunchAgent:

```sh
./macos/ho-desktop/install.sh
```

To compile and sign the executable without installing it:

```sh
./macos/ho-desktop/build.sh
```

The first run installs the executable and opens Accessibility settings. Grant access to `~/.local/bin/ho-desktop`, then run the installer again to start it. Check its state and diagnostics with:

```sh
~/.local/bin/ho-desktop --check
launchctl print gui/$UID/io.github.hi-ogawa.ho-desktop
```

Logs are written under `~/Library/Logs/ho-desktop`. To uninstall:

```sh
./macos/ho-desktop/install.sh uninstall
```
