# claude-desktop without Cowork

The AUR [`claude-desktop`](https://aur.archlinux.org/packages/claude-desktop) package repackages Anthropic's official Linux build. On x86_64 it hard-depends on QEMU and UEFI firmware because Cowork runs its sandbox in a local VM, which pulls in about 19 packages. [`no-cowork.patch`](no-cowork.patch) makes that VM stack optional and drops the symlinks that map Debian's VM paths to Arch's, so Chat and Code install with no extra dependencies.

## Install

```bash
git clone https://aur.archlinux.org/claude-desktop.git ~/code/installed/claude-desktop
cd ~/code/installed/claude-desktop
git apply ~/code/personal/dotfiles/aur/claude-desktop/no-cowork.patch
makepkg -si
```

## Upgrade

The app does not update itself on Linux, so rebuild when the AUR package has a new version. Since the patched package keeps the AUR version, `yay -Syu` reports the upgrade like any other AUR package, but install it with these commands rather than through `yay`:

```bash
cd ~/code/installed/claude-desktop
git checkout PKGBUILD
git pull
git apply ~/code/personal/dotfiles/aur/claude-desktop/no-cowork.patch
makepkg -si
```

If `git apply` rejects the patch, upstream changed the lines it touches. Edit `PKGBUILD` by hand to keep `qemu-system-x86`, `edk2-ovmf`, `socat`, and `virtiofsd` out of `depends`, delete the Cowork compatibility shims in `package()`, then refresh the patch with `git diff > ~/code/personal/dotfiles/aur/claude-desktop/no-cowork.patch`.

To use Cowork later, switch to the unpatched AUR package with `yay -S claude-desktop`.
