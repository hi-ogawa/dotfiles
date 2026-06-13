# Shell on Windows

Notes on Windows shell architecture and performance, coming from Arch Linux.

## PowerShell vs Bash Architecture

### Layering Comparison

```
Bash (Unix)                          PowerShell (Windows)
─────────────────────────────────    ─────────────────────────────────
Shell (bash)                         Shell + Runtime (PowerShell.exe)
  - REPL, scripting                    - REPL, scripting
  - limited builtins                   - .NET CLR runtime
  - strings, arrays, globs             - .NET objects
         │                                      │
         │ fork/exec                            │ in-process
         ▼                                      ▼
External commands (ls, grep, etc.)   Cmdlets (.NET classes in DLLs)
  - separate processes                 - loaded into same process
  - communicate via stdin/stdout       - communicate via object pipeline
  - from coreutils, etc.               - from modules
         │                                      │
         │ POSIX syscalls                       │ .NET → Win32 API
         ▼                                      ▼
Kernel                               Windows Kernel
```

### Key Differences

| Aspect        | Bash                    | PowerShell             |
| ------------- | ----------------------- | ---------------------- |
| Runtime       | minimal shell           | full .NET CLR          |
| Data types    | strings (mostly)        | .NET objects           |
| Commands      | external processes      | in-process cmdlets     |
| IPC           | stdin/stdout bytes      | object pipeline        |
| Composability | universal (any process) | within PowerShell only |

### Cmdlet Sources

```
PowerShell.exe
├── Core cmdlets (ship with PowerShell)
│   └── Get-ChildItem, Select-Object, etc.
│
├── Windows modules (ship with Windows OS)
│   └── Defender, DISM, Hyper-V, Storage, etc.
│   └── e.g., C:\Windows\System32\WindowsPowerShell\v1.0\Modules\Defender
│
└── Third-party modules (install separately)
    └── Az, AWS.Tools, etc.
```

Check current settings: `Get-MpPreference`
List module location: `Get-Module Defender -ListAvailable`

### Better Mental Model

PowerShell is closer to **Node.js/Python with REPL** than to bash:

- Bash: minimal language, orchestrates external processes
- PowerShell: full .NET language with shell conveniences
- Node.js: full JS language, can add shell-like usage via libs

Cmdlets are just **standard library** for a .NET scripting language.

### External Commands in PowerShell

When calling external programs (git, etc.), PowerShell falls back to text:

```powershell
# Cmdlet to cmdlet: objects flow
Get-ChildItem | Where-Object { $_.Length -gt 1MB }

# External command: text, not objects
git status | Where-Object { $_ -match "modified" }
```

This is the tradeoff: rich object model in-process, but no universal IPC primitive like Unix stdin/stdout.

### References

- [PowerShell (open source)](https://github.com/PowerShell/PowerShell)
- [PowerShell documentation](https://learn.microsoft.com/en-us/powershell/)
- [Defender module](https://learn.microsoft.com/en-us/powershell/module/defender/) - example of Windows-shipped module

## Performance

### Startup Latency

#### PowerShell (Windows 5.1/7+)

- **Typical startup**: 1-3 seconds
- **Cross-platform PowerShell Core**: 2-4 seconds (slower due to .NET runtime)
- **Major slowdown factors**:
  - Complex profiles with many modules
  - Antivirus scanning of PowerShell scripts
  - Network-dependent module imports

#### Git Bash

- **Typical startup**: 0.5-2 seconds
- **Can be extremely slow** (10+ seconds) with:
  - Heavy `.bashrc`/`.bash_profile` configurations
  - Antivirus interference
  - Network drive mappings
  - Large PATH variables

#### WSL Bash

- **Typical startup**: 1-2 seconds
- **Generally faster** than Git Bash for native Linux tools
- **Overhead**: WSL subsystem initialization

### Bottlenecks

1. **Profile loading time** (both shells)
2. **Antivirus real-time scanning**
3. **Module/extension loading**
4. **Network path resolution**

### Windows Terminal Impact

- **Pre-1.19**: Significant input latency issues
- **Post-1.19**: ~50% latency improvement, now competitive
- **GPU acceleration** helps with rendering, not shell startup

## Optimization Strategies

### For PowerShell

```powershell
# Minimize profile scripts
$PSModuleAutoLoadingPreference = "None"

# Exclude from antivirus (if possible)
# Add PowerShell directories to Windows Defender exclusions
```

### For Git Bash

```bash
# Keep .bashrc minimal
# Avoid network drives in PATH
# Use mintty directly instead of Windows Terminal wrapper
# Launch mintty directly: "C:\Program Files\Git\usr\bin\mintty.exe"
```

### WSL (Recommended)

- **Best performance** for development workflows
- **Additional overhead** only for cross-filesystem operations (avoid `/mnt/c/`)
- **Use this** for all terminal/development work

## Terminal Emulator Options

### Windows Terminal (Recommended)

- Native integration, tabs, panes
- Good bash support via profiles
- Recent performance improvements

### WezTerm

- Cross-platform, GPU-accelerated
- Highly configurable
- Built-in multiplexer

### Alacritty

- Minimal, fast
- GPU-accelerated
- Simple configuration

### Mintty

- **Default terminal for Git Bash**
- Lightweight, fast terminal emulator
- Originally for Cygwin/MSYS2, now used by Git for Windows
- **Pros**: Very fast startup, minimal resource usage, native Windows UI
- **Cons**: No tabs/panes, basic features only
- **Best for**: Quick Git Bash sessions without overhead

## Benchmarks

### Real-world startup times (typical machine)

- **PowerShell**: ~2.1s
- **Git Bash**: ~1.3s (can spike to 8s+)
- **WSL Bash**: ~1.6s
- **Arch Linux Bash**: ~0.3s (for comparison)

### Process execution overhead

- Git Bash: ~100ms for simple commands
- PowerShell: ~50ms for simple cmdlets
- WSL: ~30ms for native Linux commands

## Recommendations

1. **For development**: WSL2 - no contest, use this for all terminal work
2. **For Windows-native tasks**: PowerShell (rarely needed)
3. **Avoid**: Git Bash for development (~100ms overhead per command makes interactive work slow)

## Configuration Tips

### Minimal PowerShell Profile

```powershell
# Only load essential modules
Import-Module Microsoft.PowerShell.Management
Import-Module Microsoft.PowerShell.Utility

# Fast prompt
function prompt { "PS $PWD> " }
```

### Minimal Bash Profile

```bash
# ~/.bashrc - keep it minimal
export PS1='\w\$ '
# Avoid loading heavy frameworks like oh-my-posh/oh-my-bash
```

### Windows Terminal Settings

```json
{
  "profiles": {
    "defaults": {
      "fontFace": "Cascadia Code",
      "fontSize": 12
    }
  }
}
```

## Future Considerations

- Windows Terminal continues improving performance
- WSL2 performance getting closer to native Linux
- PowerShell 7+ cross-platform improvements
- Consider Windows 11 Dev Channel for latest optimizations
