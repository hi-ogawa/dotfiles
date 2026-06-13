# Linux Setup

## Installation

### Boot from USB

1. Create bootable USB with Ventoy (same as Windows setup)
2. Copy Arch ISO to Ventoy USB
3. Boot from USB (Dell: **F12** for boot menu, **F2** for BIOS)
4. Select Arch ISO in Ventoy

### archinstall

Make sure you have internet connection (e.g. USB tethering)

Run the guided installer:

```bash
archinstall
```

Menu items (as of 2026-01):

| Menu Item                 | Value                                     |
| ------------------------- | ----------------------------------------- |
| Archinstall language      | English                                   |
| Locales                   | `en_US.UTF-8`                             |
| Mirrors and repositories  | Select your region                        |
| **Disk configuration**    | Best-effort default, ext4                 |
| Swap                      | zram enabled (default)                    |
| Bootloader                | systemd-boot (default)                    |
| **Kernels**               | `linux` (default)                         |
| Hostname                  | Pick a name                               |
| Authentication            | Create user with sudo, skip root password |
| Profile                   | Desktop → GNOME                           |
| Applications              | Audio: pipewire, Bluetooth: enabled       |
| Network configuration     | NetworkManager                            |
| Parallel Downloads        | 5 (speeds up install)                     |
| Additional packages       | (empty. can do post-install)              |
| Timezone                  | Your timezone                             |
| Automatic time sync (NTP) | true (default)                            |

**Bold** = mandatory

After install completes, skip chroot and reboot. Remove USB when prompted.

## Post-install

### GNOME settings

```bash
# touchpad
gsettings set org.gnome.desktop.peripherals.touchpad tap-to-click true

# key repeat (Settings > Accessibility > Typing also works)
gsettings set org.gnome.desktop.peripherals.keyboard repeat-interval 25  # default 30
gsettings set org.gnome.desktop.peripherals.keyboard delay 150           # default 500
```

Via **gnome-tweaks**:

- Keyboard & Mouse → Additional Layout Options → Ctrl position → Swap Ctrl and Caps Lock
- Fonts → Monospace → Roboto Mono

### Install apps

- install Yay

```bash
pacman -S git base-devel nano bash-completion man-db man-pages
git clone https://aur.archlinux.org/yay-bin.git ~/code/installed/yay-bin
cd ~/code/installed/yay-bin
makepkg -si
```

- more packages

```bash
yay -S google-chrome visual-studio-code-bin ghostty jq htop nnn yazi ttf-roboto-mono noto-fonts-cjk
```

- install Homebrew https://brew.sh/

### Setup Dotfiles

```bash
git clone https://github.com/hi-ogawa/dotfiles ~/code/personal/dotfiles
cd ~/code/personal/dotfiles
./sync.sh apply
```

### SSH and GitHub

```bash
ssh-keygen -t ed25519 -C <email>
# Add key to GitHub: https://github.com/settings/keys
gh auth login
```

## References

- [Arch Wiki - Installation guide](https://wiki.archlinux.org/title/Installation_guide)
- [Arch Wiki - archinstall](https://wiki.archlinux.org/title/Archinstall)
- [Arch Wiki - GNOME](https://wiki.archlinux.org/title/GNOME)
