# Windows Setup

For full setup guide (OS install, post-install setup, etc.), see:
- https://github.com/hi-ogawa/windows-setup

## Verify

After applying dotfiles:

```bash
git config --list --show-origin # Should show your aliases
type y # Should show yazi wrapper function
```

## Note: Line endings after first apply

On fresh Windows setup, Git for Windows defaults to `autocrlf=true`. After `apply` sets `autocrlf=false`, git sees all repo files as modified (LF in storage vs CRLF in working dir). Fix with:

```bash
git checkout .        # Restore repo files to LF
./sync.sh apply       # Re-apply LF files to system
```
