# claude-desktop without Cowork

The AUR [`claude-desktop`](https://aur.archlinux.org/packages/claude-desktop) package repackages Anthropic's official Linux build. On x86_64 it hard-depends on QEMU and UEFI firmware because Cowork runs its sandbox in a local VM, which pulls in about 19 packages. This directory holds a copy of that PKGBUILD without the VM stack and its path shims, so Chat and Code install with no extra dependencies. It builds for x86_64 only.

## Install

```bash
cd aur/claude-desktop
makepkg -si
```

## Upgrade

The app does not update itself on Linux, and `yay -Syu` offers the stock AUR package, which brings the VM stack back. Skip it there and rebuild this copy instead, with the new version from the AUR page:

```bash
cd aur/claude-desktop
sed -i 's/^pkgver=.*/pkgver=<new version>/' PKGBUILD
updpkgsums
makepkg -si
```

`updpkgsums` comes from `pacman-contrib`.

To use Cowork later, switch to the stock AUR package with `yay -S claude-desktop`.
