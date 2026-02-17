# Arch Linux Setup

For full setup guide (installation, post-install, dev setup), see:

- https://github.com/hi-ogawa/linux-setup

## Apply dotfiles

```bash
git clone https://github.com/hi-ogawa/dotfiles ~/code/personal/dotfiles
cd ~/code/personal/dotfiles
./sync.sh apply
```

## Verify

```bash
git config --list --show-origin # Should show your aliases
type y # Should show yazi wrapper function
```
