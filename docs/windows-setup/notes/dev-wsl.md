# Development Environment - WSL (Recommended)

## Installation

```powershell
wsl --install Ubuntu
```

- Installs WSL2 with specified distro
- Requires reboot

**After reboot - launch WSL:**

```powershell
wsl                          # From PowerShell/Terminal
# Or: Search "Ubuntu" (or distro name) in Start menu
# Or: Open Windows Terminal → dropdown → select distro
```

**First launch behavior varies by distro:**

- **Ubuntu/Debian**: Auto-prompts to create Linux username/password (separate from Windows account)
- **Arch Linux**: Drops you into root shell - no auto-prompt. Manually create user, then set default:
  ```powershell
  wsl --manage archlinux --set-default-user yourusername
  ```

**Note:** `wsl --install` alone (without distro name) is documented to install Ubuntu by default, but in practice it may only install WSL components without a distro if WSL is already partially present. Always specify the distro explicitly.

**List and install distros:**

```powershell
wsl --list --online          # List available distros
wsl --install Debian         # Install Debian
wsl --install archlinux      # Install Arch Linux
```

### Known Gotchas

| Issue                          | Symptom                                          | Fix                                            |
| ------------------------------ | ------------------------------------------------ | ---------------------------------------------- |
| WSL already present            | `wsl --install` shows help instead of installing | Specify distro: `wsl --install Ubuntu`         |
| Windows 11 24H2                | "Catastrophic failure"                           | Ensure WSL installs on C: drive (system drive) |
| Virtualization disabled        | Install fails or WSL2 won't start                | Enable virtualization in BIOS                  |
| Stuck at 0%                    | Install hangs indefinitely                       | Use `wsl --install --web-download <distro>`    |
| WSL_E_DEFAULT_DISTRO_NOT_FOUND | Distro won't launch after install                | Run `wsl --update` first, enable Hyper-V       |

**Recommended fresh install:**

```powershell
wsl --update                 # Update WSL first (if already present)
wsl --install archlinux      # Then install distro explicitly
```

## Why WSL?

Coming from Arch Linux, native Windows PowerShell development introduces friction:

- Different PATH behavior and environment variables
- CRLF vs LF line ending issues
- Windows-specific tooling (winget vs package managers like pacman/apt)
- Shell scripting differences (PowerShell vs bash/zsh)

**WSL (Windows Subsystem for Linux)** provides a real Linux environment on Windows:

- Full Linux kernel (WSL2)
- Native Linux tooling (apt/pacman, bash, ssh, git)
- Familiar workflow from Arch Linux
- Better compatibility with Linux-focused dev tools
- Can still access Windows filesystem (`/mnt/c/...`)

### Performance Comparison

Even trivial commands show significant overhead in Git Bash (MSYS2) vs WSL:

**Git Bash on Windows (`/c/...`):**

```bash
$ time echo foo
real    0m0.100s  # ~100ms overhead per command
$ time pwd
real    0m0.098s
```

**WSL (native Linux):**

```bash
$ time echo foo
real    0m0.000s  # Near-instant
$ time pwd
real    0m0.000s
```

The ~100ms process creation overhead in Git Bash adds up quickly during interactive shell work (git operations, build scripts, npm tasks). WSL has no emulation layer, so every command feels instant.

## Filesystem

WSL has **two separate filesystems** that can access each other:

### WSL → Windows

Windows drives are auto-mounted in WSL:

```bash
/mnt/c/Users/hiroshi/...  # C:\ drive
/mnt/d/...                 # D:\ drive (if exists)
```

From WSL, you can access any Windows file:

```bash
cd /mnt/c/Users/hiroshi/Documents
ls /mnt/c/Users/hiroshi/code/temporary
```

### Windows → WSL

WSL filesystem is accessible from Windows via network path:

```
\\wsl$\Ubuntu\home\username\...
\\wsl.localhost\Ubuntu\home\username\...
```

From File Explorer: type `\\wsl$` in address bar to see all installed distros.

From PowerShell:

```powershell
cd \\wsl$\Ubuntu\home\username\code
```

### Where is WSL filesystem stored?

WSL uses a virtual disk file (ext4 format) stored somewhere in Windows:

```
C:\Users\hiroshi\AppData\Local\Packages\CanonicalGroupLimited.Ubuntu...\LocalState\ext4.vhdx
```

**Don't access this file directly** - always use `\\wsl$\` path or access from within WSL.

### Performance considerations

- **Fast**: Files in native filesystem (Windows files on C:\, Linux files in WSL ext4)
- **Slow**: Cross-boundary operations (Linux tools on /mnt/c/ files, or Windows tools on \\wsl$\ files)

**Best practice:**

- Store Linux projects in WSL filesystem: `~/code/myproject`
- Access via Windows: `\\wsl$\Ubuntu\home\username\code\myproject`
- Avoid storing projects on `/mnt/c/` if you're using Linux tools heavily

### Recommended workflow

```bash
# In WSL - create workspace in Linux filesystem
mkdir -p ~/code
cd ~/code

# Clone repos here (fast git operations)
git clone git@github.com:user/repo.git

# Open in VSCode from WSL
code .
```

VSCode with WSL extension handles the bridging automatically.

## VSCode + WSL Integration

VSCode WSL extension:

- Open VSCode in Windows
- Install "WSL" extension
- `Ctrl+Shift+P` → "WSL: New Window" opens VSCode connected to WSL
- VSCode terminal is now Linux bash (not PowerShell)
- File operations happen in Linux filesystem
- Extensions run in WSL context

### Common Issue: `code` Command "Exec format error"

**Symptom:**

```bash
$ code .
/mnt/c/Users/.../AppData/Local/Programs/Microsoft VS Code/Code.exe: Exec format error
```

**Fix:**
Restart WSL from PowerShell:

```powershell
wsl --shutdown
```

Then relaunch WSL and try again.

## Network Performance Issues

WSL2 has known network bottlenecks that can significantly reduce download/upload speeds.

**Symptoms:**

- Native Windows: 100+ Mbps
- WSL2: 3-20 Mbps (or worse)

**Main cause: Large Send Offload (LSO)**
The virtual ethernet adapter has LSO enabled by default, which can severely throttle network performance.

**Fix (PowerShell as admin):**

```powershell
Disable-NetAdapterLso -Name "vEthernet (WSL)" -IncludeHidden
```

**Additional fixes:**

1. **Windows Defender exclusions** - Add WSL folders to antivirus exceptions
2. **Restart WSL** - After config changes: `wsl --shutdown` then relaunch

**Test speeds:**

```bash
# In WSL
curl -o /dev/null https://speed.cloudflare.com/__down?bytes=100000000
```

**Note:** Even after fixes, WSL2 networking won't match native Linux due to virtualization overhead. Most users report "good enough for dev work" after applying the LSO fix.

## Workflow

1. Windows-side: VSCode, browser, GUI apps
2. WSL-side: Git, Python, Node.js, development tools, file system
3. VSCode bridges both seamlessly via Remote extension

## Trade-offs

**Pros:**

- Familiar Linux environment
- Better shell scripting, package management
- No CRLF/PATH/credential quirks
- Native Linux tools work as expected

**Cons:**

- Cross-boundary file I/O is slower (Linux tools reading `/mnt/c/` files)
- Additional layer of complexity
- Path handling: Need to use `\\wsl$\Ubuntu\...` for Windows apps to access WSL files
  - Example: Script generates file in WSL → upload via browser → must navigate to `\\wsl$\Ubuntu\home\username\output\file.pdf`
  - Most Windows apps handle `\\wsl$\` paths fine, but some may have issues with UNC network paths
  - Can't drag-drop directly from WSL terminal to Windows GUI apps

**Practical workaround for file sharing:**

- Pin WSL home in File Explorer: `\\wsl$\Ubuntu\home\username` → Quick Access
- Or: Generate files to `/mnt/c/Users/hiroshi/Downloads` for easy Windows access (slower, but trivial to find)

## Summary

WSL is the recommended approach for development on Windows. The [dotfiles sync script](https://github.com/hi-ogawa/dotfiles) detects WSL and handles both environments - Linux config to WSL, VSCode settings to Windows host. Just run `./sync.sh apply` once from WSL.
