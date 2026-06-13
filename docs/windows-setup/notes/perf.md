# Windows Performance Optimization

Coming from Arch Linux, Windows performance can feel sluggish. This document covers optimization strategies for development work.

## Windows Defender Impact

### Terminology (Microsoft's confusing naming)

| Term                             | What it is                                                                    |
| -------------------------------- | ----------------------------------------------------------------------------- |
| **Windows Security**             | The settings app/dashboard (Settings → Privacy & security → Windows Security) |
| **Microsoft Defender Antivirus** | The antivirus engine inside Windows Security                                  |
| **Windows Defender**             | Old name, still used in PowerShell cmdlets (`Get-MpPreference`) and registry  |

They're the same thing with different names. "Virus & threat protection" in Windows Security controls Microsoft Defender Antivirus.

### Performance Issues

- **Real-time scanning**: 50-200ms overhead on file operations
- **Script scanning**: Significant PowerShell/Bash startup slowdown
- **Background processes**: Constant CPU/RAM usage
- **Network filtering**: Impact on development tools and network operations

### Measured Impact

- **Shell startup**: 2-3x slower with Defender enabled
- **File operations**: 100ms+ added latency
- **Build processes**: 10-30% slower due to scanning
- **Git operations**: Noticeable lag on large repositories

## Windows Defender Optimization

### Check Current Settings

```powershell
Get-MpPreference
```

### Recommended: Strategic Exclusions

Instead of complete disable, use targeted exclusions for development:

```powershell
# Development directories
Add-MpPreference -ExclusionPath "C:\Users\hiroshi\code"
Add-MpPreference -ExclusionPath "C:\Users\hiroshi\scoop"

# Shell and terminal tools
Add-MpPreference -ExclusionPath "C:\Program Files\Git"
Add-MpPreference -ExclusionPath "C:\Windows\System32\WindowsPowerShell"
Add-MpPreference -ExclusionPath "C:\Program Files\PowerShell"
Add-MpPreference -ExclusionPath "C:\Program Files\WezTerm"
# Windows Terminal (Store) is in WindowsApps - excluding scoop/code dirs is usually sufficient

# Script file extensions
Add-MpPreference -ExclusionExtension ".ps1"
Add-MpPreference -ExclusionExtension ".sh"
Add-MpPreference -ExclusionExtension ".py"
Add-MpPreference -ExclusionExtension ".js"
Add-MpPreference -ExclusionExtension ".ts"
Add-MpPreference -ExclusionExtension ".json"
Add-MpPreference -ExclusionExtension ".yml"
Add-MpPreference -ExclusionExtension ".yaml"
```

### Alternative: Complete Disable

**Simplest (GUI, temporary):**
Windows Security → Virus & threat protection → Manage settings → Turn off all toggles:

- Real-time protection
- Cloud-delivered protection
- Automatic sample submission
- Tamper protection

Note: Windows will re-enable these after some time or reboot.

**PowerShell method (requires admin):**

```powershell
# Disable all real-time protection
Set-MpPreference -DisableRealtimeMonitoring $true
Set-MpPreference -DisableBehaviorMonitoring $true
Set-MpPreference -DisableBlockAtFirstSeen $true
Set-MpPreference -DisableIOAVProtection $true
Set-MpPreference -DisableScriptScanning $true
Set-MpPreference -DisableArchiveScanning $true
```

**Gotchas:**

- **Tamper Protection** blocks these changes. Must disable it first via GUI:
  Settings → Privacy & security → Windows Security → Virus & threat protection → Manage settings → Tamper Protection → Off
- **Windows may re-enable** Defender after updates
- **PowerShell commands are temporary** - reset on reboot
- **Exclusions (`Add-MpPreference`)** may still work with Tamper Protection on (behavior varies by Windows version/edition)

### Third-Party Alternative (Recommended for Permanent Disable)

Install antivirus that registers with Windows Security Center - Defender automatically enters "passive mode":

- **Bitdefender Free**: Registers with WSC, minimal performance impact
- **Malwarebytes Premium**: Registers with WSC (Free version does NOT - it runs alongside Defender)

**Why this works but manual disable doesn't:**

Third-party AV uses Windows Security Center (WSC) API to register as the primary antivirus. When WSC detects a registered provider:

1. Windows automatically puts Defender in passive/disabled mode
2. Tamper Protection allows this because it's the "blessed" pathway

To register with WSC, software must:

- Use private Microsoft APIs (not publicly documented)
- Run as a **Protected Process** (requires Microsoft code-signing certificate)
- Be recognized by WSC as a legitimate security vendor

Microsoft's design intent: Defender should only be disabled when _replaced_ by another security product, not turned off entirely. From their perspective, "user disabling protection = security risk to block" while "another AV taking over = acceptable transition."

## System-Level Optimizations

### Power Settings

```powershell
# Set to high performance mode
powercfg /setactive SCHEME_MIN

# Disable hibernation (saves SSD space)
powercfg /hibernate off
```

### Visual Effects

- Disable animations and transparency
- Set performance mode for visual effects
- Use classic theme elements where possible

### Services to Disable

```powershell
# Disable unnecessary services
sc config "Fax" start= disabled
sc config "PrintNotify" start= disabled
sc config "WSearch" start= disabled  # Windows Search (if not needed)
```

## Storage Optimization

### Dev Drive (Windows 11 22H2+)

```powershell
# Create Dev Drive for better performance
# Requires ReFS format and dedicated partition
# Available since Build 22621.2361 (Oct 2023)
```

### SSD Optimization

- Enable write caching
- Disable drive indexing for code directories
- Configure TRIM support

## Network Performance

### DNS Optimization

```powershell
# Set fast DNS servers
netsh interface ip set dns "Ethernet" static 1.1.1.1 primary
netsh interface ip add dns "Ethernet" 8.8.8.8 index=2
```

### Windows Firewall

Consider disabling for trusted networks or adding specific rules for development tools.

## Memory Management

### Virtual Memory

- Configure page file on separate drive if available
- Set custom size based on RAM + workload

### Process Priority

```powershell
# Set development tools to high priority
Get-Process "code" | ForEach-Object { $_.PriorityClass = "High" }
```

## Benchmarking

### Before/After Measurements

```powershell
# Measure shell startup time
Measure-Command { powershell -NoProfile -Command "exit" }

# Measure file operation
Measure-Command { Get-ChildItem -Recurse C:\Users\hiroshi\code }

# Measure git operations
cd C:\Users\hiroshi\code\repo
Measure-Command { git status }
```

### Expected Improvements

- **Shell startup**: 50-70% faster with exclusions
- **File operations**: 80% faster in excluded directories
- **Build times**: 20-30% improvement
- **Git operations**: 40% faster on large repos

## Monitoring

### Performance Counters

- CPU usage by MsMpEng.exe (Defender)
- Disk I/O latency
- Memory usage patterns
- Network latency

### Tools

- **Process Explorer**: Detailed process analysis
- **Resource Monitor**: Real-time performance monitoring
- **Windows Performance Analyzer**: Advanced profiling

## Security Considerations

### Risk Assessment

- **Full disable**: Zero protection, highest performance
- **Exclusions**: 90% performance, basic protection retained
- **Default**: Full protection, significant performance impact

### Best Practices

- Keep browser protection enabled
- Scan downloads manually if needed
- Use network-level protection (router/firewall)
- Regular system backups

## Recovery

### Reset Exclusions

```powershell
# Remove all exclusions (must iterate - wildcard doesn't work)
(Get-MpPreference).ExclusionPath | ForEach-Object { Remove-MpPreference -ExclusionPath $_ }
(Get-MpPreference).ExclusionExtension | ForEach-Object { Remove-MpPreference -ExclusionExtension $_ }
```

### Restore Default Settings

```powershell
# Reset Defender to defaults
Set-MpPreference -DisableRealtimeMonitoring $false
Set-MpPreference -DisableBehaviorMonitoring $false
Set-MpPreference -DisableBlockAtFirstSeen $false
Set-MpPreference -DisableIOAVProtection $false
Set-MpPreference -DisableScriptScanning $false
```

## Recommendations

### For Development Machine

1. **Use strategic exclusions** (recommended)
2. **Disable Windows Search** if not needed
3. **Set high performance power plan**
4. **Use SSD for code directories**
5. **Consider third-party lightweight antivirus**

### For Maximum Performance

1. **Install Bitdefender Free** (puts Defender in passive mode - most reliable on Windows 11 24H2+)
2. **Or use strategic exclusions** if keeping Defender
3. **Disable all unnecessary services**
4. **Use Dev Drive if available**
5. **Optimize network settings**

### Coming from Arch Linux

- Expect 2-3x slower shell startup even with optimizations
- File operations will always have some overhead
- Consider dual boot for critical performance workloads
- WSL2 provides closest experience to native Linux
