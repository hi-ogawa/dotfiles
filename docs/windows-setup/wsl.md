# WSL Setup

## Install

Install WSL from PowerShell:

```powershell
wsl --update
wsl --install Ubuntu
```

Reboot if prompted, then launch the distro:

```powershell
wsl
```

If installing another distro:

```powershell
wsl --list --online
wsl --install Debian
wsl --install archlinux
```

Arch Linux starts as root. Create a user and set it as default:

```powershell
wsl --manage archlinux --set-default-user <user>
```

## Tools

Inside WSL:

```bash
sudo apt update
```

Install Homebrew for Linux, then:

```bash
brew install yazi gh
```

## Project Files

Keep development projects in the WSL filesystem:

```bash
mkdir -p ~/code
cd ~/code
git clone git@github.com:<owner>/<repo>.git
```

Avoid using Linux tools heavily on `/mnt/c/...` project directories.

From Windows, WSL files are available under:

```text
\\wsl$\Ubuntu\home\<user>
\\wsl.localhost\Ubuntu\home\<user>
```

## VSCode

Install the VSCode WSL extension on Windows.

Open projects from WSL:

```bash
code .
```

If `code .` fails with `Exec format error`, restart WSL from PowerShell:

```powershell
wsl --shutdown
```

## Dotfiles

Run dotfiles sync from WSL:

```bash
git clone https://github.com/hi-ogawa/dotfiles ~/code/personal/dotfiles
cd ~/code/personal/dotfiles
./sync.sh apply
```

On WSL, `sync.sh` applies Linux dotfiles to WSL and routes VSCode settings to the Windows host.

## Network

If WSL networking is much slower than native Windows, disable Large Send Offload on the WSL adapter from an admin PowerShell:

```powershell
Disable-NetAdapterLso -Name "vEthernet (WSL)" -IncludeHidden
```

Restart WSL after network changes:

```powershell
wsl --shutdown
```
