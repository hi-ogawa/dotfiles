# Windows Setup

The same content is found in https://github.com/hi-ogawa/windows-setup

## Installation

- USB installer
  - Download Windows 11 ISO from Microsoft
  - _Download ISO matching your target language (e.g., English US) to avoid slow language pack downloads during install_
  - Create bootable USB with Ventoy from Linux
- Boot and install
  - Boot from USB stick with Ventoy + Windows ISO
  - Launch installer via Ventoy (Normal mode)
  - _Pick English (US) for language/keyboard - UK is hard to remove later_
- Disk setup
  - Delete all partitions on target disk, leave as unallocated space
  - Let Windows auto-create partitions
  - _Note: Laptops shipped with Windows have OEM license that activates automatically_
- Network setup
  - At "Connect to network" screen: `Shift + F10`
  - Run: `OOBE\BYPASSNRO`
  - System reboots, then select "I don't have internet"
  - _See [Troubleshooting](#no-wifi-networks-during-installation) if WiFi networks don't appear_
- Local account creation
  - _With BYPASSNRO, this goes straight to local user setup (no Microsoft sign-in prompt)_
  - _Alternative (if you have network): `Shift + F10`, run `start ms-cxh:localonly` to skip Microsoft sign-in_
  - Create local user in the dialog that appears
  - _Skip optional services and personalization prompts during setup_

## Post-install

- Verify activation
  - Settings → System → Activation (should show "Activated with a digital license")
- Desktop settings
  - Display scaling
    - Settings → Display → Scale
    - _Windows defaults to 150% on laptops - consider 100% if you prefer more screen space_
  - Keyboard repeat
    - Settings → Accessibility → Keyboard
    - Adjust key repeat delay and rate
  - Mouse/Touchpad speed
    - Settings → Bluetooth & devices → Mouse → Mouse pointer speed
    - Settings → Bluetooth & devices → Touchpad → Touchpad speed, Taps
    - Settings → Bluetooth & devices → Touchpad → Three-finger gestures → Taps: Middle mouse button
  - File Explorer
    - File Explorer → View → Show → File name extensions
    - Disable folder tracking: File Explorer → ... (three dots) → Options → Privacy → Uncheck "Show frequently used folders"
  - Taskbar
    - Right-click taskbar → Taskbar settings
    - Hide unnecessary UI through Taskbar behaviors, items, etc
      - Show taskbar on all displays: OFF
  - PowerToys
    - Swap Ctrl/Cap: Keyboard Manager → Remap keys: Caps Lock ↔ Left Ctrl
    - Disable "find my mouse" (triggered by Ctrl double tap)
- Install Chrome
  - Install, sign in, sync bookmarks and extensions

```powershell
winget install -e --id Microsoft.PowerToys
winget install -e --id Google.Chrome
winget install -e --id Git.Git
winget install -e --id Microsoft.VisualStudioCode
```

- Install scoop (https://scoop.sh) for Windows native apps:

```powershell
scoop install wezterm anki
```

## Dev setup (WSL)

- Install WSL
  - `wsl --install Ubuntu`
  - See [notes/dev-wsl.md](notes/dev-wsl.md) for details.

- Install tools
  - `sudo apt update`
  - setup Homebrew https://docs.brew.sh/Homebrew-on-Linux
    - `brew install yazi gh`

- Setup dotfiles (see https://github.com/hi-ogawa/dotfiles):
  - `git clone https://github.com/hi-ogawa/dotfiles` and `./sync.sh apply`

- Setup SSH and GitHub:
  - `ssh-keygen -t ed25519 -C <email>`
  - https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent

### Dotfiles: WSL vs Windows

The [sync script](https://github.com/hi-ogawa/dotfiles) detects WSL and routes config appropriately:

- Linux dotfiles → WSL home (`~/.bashrc`, `~/.gitconfig`, etc.)
- VSCode settings → Windows host (`%APPDATA%/Code/User/...`)

## Desktop tips

- Search and launch apps: Windows key, then type app name
- Shell
  - PowerShell (no need for Command Prompt)
  - Bash (from Git.Git)
- Window management
  - Alt + Tab: cycle through all windows
  - Alt + ` (backtick): cycle through windows of same app
  - Win + Shift + Left/Right Arrow: move window between monitors
- File Explorer
  - Ctrl + Shift + N: create new folder

## Drivers and OEM Software

See [notes/drivers.md](notes/drivers.md) for details on:

- Where drivers come from (Windows Update vs OEM vs vendor)
- OEM support tools and workflows
- Background software (what to keep/disable)
- Troubleshooting audio glitches

**Quick summary:** If you installed from a clean Microsoft ISO (not OEM recovery image), check your laptop manufacturer's support page for driver updates. Windows Update includes drivers but they're often outdated. Prioritize BIOS, chipset, and audio drivers.

## Troubleshooting

### No WiFi networks during installation

If the network selection screen is empty and shows "Install driver", the WiFi adapter driver isn't included in the Windows installer.

**Solutions (pick one):**

1. **Skip network requirement** - Easiest option
   - Press `Shift + F10` to open command prompt
   - Run: `OOBE\BYPASSNRO`
   - System reboots, then select "I don't have internet"
   - Install WiFi driver after Windows setup completes

2. **USB tethering from phone**
   - Connect phone via USB cable
   - Enable USB tethering in phone settings
   - Usually works without additional drivers

3. **Use Ethernet**
   - Connect via USB-to-Ethernet adapter or docking station

4. **Load driver manually**
   - Download WiFi driver from laptop manufacturer's website on another computer
   - Extract and copy to USB stick
   - Click "Install driver" and browse to USB

### Winget "Failed when searching source: msstore" (0x8a15005e)

Certificate pinning error. Fix with (requires admin terminal):

```bash
winget settings --enable BypassCertificatePinningForMicrosoftStore
```
