# Git Configuration

## Git for Windows system defaults

Git for Windows sets Windows-specific defaults at `C:\Program Files\Git\etc\gitconfig`:

```ini
# Line ending auto-conversion (we override this to false)
core.autocrlf = true

# Symlinks disabled (creates text files instead)
core.symlinks = false

# Windows SSL and credential storage
http.sslbackend = schannel
credential.helper = manager

# Performance optimization
core.fscache = true
```

**Key override:**

- **autocrlf=true**: System default converts LF↔CRLF automatically
  - **We override to false** (modern approach: use LF everywhere)

## User configuration

See **[.gitconfig](https://github.com/hi-ogawa/dotfiles/blob/main/.gitconfig)** for the config.

Key settings:

- `core.autocrlf = false` - Override Git for Windows default (use LF everywhere)
- Git aliases (st, ci, co, br, lg, lga)
- `push.autoSetupRemote = true` - No need for -u flag on first push

Apply via [dotfiles](https://github.com/hi-ogawa/dotfiles):

```bash
./sync.sh apply gitconfig
```

## SSH and GitHub setup

Follow https://docs.github.com/en/authentication/connecting-to-github-with-ssh

**Windows-specific notes:**

- ssh-agent doesn't persist across Git Bash sessions (unlike Linux)
- Add ssh-agent auto-start to `~/.bashrc` if needed
- Two SSH implementations: Git Bash SSH (`/usr/bin/ssh`) and Windows OpenSSH (`C:\Windows\System32\OpenSSH\ssh.exe`)
- Both are interoperable, keys stored in `~/.ssh/`
