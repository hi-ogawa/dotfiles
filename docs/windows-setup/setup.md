# Windows Setup

## Install Windows

1. Download a Windows 11 ISO from Microsoft.
2. Create a bootable USB with Ventoy.
3. Boot from the USB stick and launch the installer in normal mode.
4. Delete all partitions on the target disk and install into the unallocated space.
5. At the network screen, press `Shift + F10`, run `OOBE\BYPASSNRO`, then choose offline setup after reboot.
6. Create a local user and skip optional services and personalization prompts.

## Post-Install

Install basic desktop apps:

```powershell
winget install -e --id Microsoft.PowerToys
winget install -e --id Google.Chrome
winget install -e --id Git.Git
winget install -e --id Microsoft.VisualStudioCode
```

Install Scoop and native Windows apps:

```powershell
scoop install anki
```

Apply desktop settings:

- Verify activation: Settings -> System -> Activation.
- Show file extensions in File Explorer.
- Hide unneeded taskbar items.
- Set touchpad three-finger tap to middle mouse button.
- In PowerToys, remap Caps Lock and Left Ctrl.
- Disable PowerToys "Find My Mouse" if Ctrl double-tap gets in the way.

Check OEM drivers after Windows Update. See [drivers.md](drivers.md).

## Development

Use WSL for development. See [wsl.md](wsl.md).

From WSL, clone and apply dotfiles:

```bash
git clone https://github.com/hi-ogawa/dotfiles ~/code/personal/dotfiles
cd ~/code/personal/dotfiles
./sync.sh apply
```

The sync script applies Linux dotfiles inside WSL and writes VSCode settings to the Windows host.

Set up SSH and GitHub from WSL:

```bash
ssh-keygen -t ed25519 -C <email>
gh auth login
```

## Troubleshooting

### No WiFi Networks During Installation

If the network selection screen is empty:

1. Use `OOBE\BYPASSNRO` to skip network setup.
2. Use USB tethering from a phone.
3. Use Ethernet.
4. Load the WiFi driver manually from a USB stick.

### Winget `msstore` Error

If `winget` fails searching `msstore` with `0x8a15005e`, run from an admin terminal:

```powershell
winget settings --enable BypassCertificatePinningForMicrosoftStore
```
