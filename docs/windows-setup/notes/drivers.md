# Windows Drivers and OEM Software

Coming from Linux, the Windows driver ecosystem works quite differently. This documents the key concepts and workflows.

## Linux vs Windows Driver Model

**Linux:** Drivers are mostly in-kernel, maintained upstream. Install the kernel, get the drivers. Proprietary drivers (NVIDIA) are exceptions.

**Windows:** Each hardware vendor maintains their own drivers separately. Microsoft distributes some via Windows Update, but vendors release newer versions independently.

## Where Drivers Come From

| Source                                | Freshness                 | Reliability | Notes                                                         |
| ------------------------------------- | ------------------------- | ----------- | ------------------------------------------------------------- |
| Windows Update                        | Old (months/years behind) | High        | WHQL certified, conservative                                  |
| Windows Update (Optional)             | Medium                    | High        | Check Settings → Windows Update → Advanced → Optional updates |
| OEM website (Dell, Lenovo)            | Medium                    | High        | Customized for your specific model                            |
| Vendor website (Realtek, NVIDIA, AMD) | Latest                    | Medium      | Generic, may miss OEM tweaks                                  |
| Device Manager "Search automatically" | Old                       | High        | Just searches Windows Update                                  |

**Best practice:** Use OEM drivers when available, fall back to vendor drivers for latest features.

## Checking Installed Driver Versions

**Device Manager:**

- Win+X → Device Manager
- Right-click device → Properties → Driver tab → "Driver Version"

**BIOS version:**

- Run `msinfo32` → "BIOS Version/Date"

**Or via PowerShell:**

```powershell
# List all drivers with versions
Get-WmiObject Win32_PnPSignedDriver | Select DeviceName, DriverVersion | Sort DeviceName
```

## Dell-Specific Workflow

Dell support page: `https://www.dell.com/support/home` (auto-detects by Service Tag)

**Manual approach:**

1. Go to Drivers & Downloads for your model
2. Compare versions against what's installed
3. Download and install manually

**SupportAssist app:**

- Scans system and shows only updates you actually need
- Can auto-install updates
- Downsides: runs in background, has had security vulnerabilities, nagware

**Recommendation:** Install SupportAssist for initial setup, run scan, then disable/uninstall if you don't want it running permanently.

### Dell Driver Priority

For a typical laptop, prioritize these:

| Driver                      | Impact                                     |
| --------------------------- | ------------------------------------------ |
| BIOS                        | Power management, hardware fixes, security |
| Chipset                     | System stability, power states             |
| Audio (Realtek)             | Sound quality, latency                     |
| Graphics (AMD/Intel/NVIDIA) | Display, performance                       |
| Wi-Fi/Bluetooth             | Connectivity stability                     |
| Storage firmware            | SSD performance, reliability               |

Skip these (bloatware):

- Dell Digital Delivery
- Dell SmartByte (network "optimization")
- Waves MaxxAudio Pro (audio effects, can cause issues)

## AMD Software Stack (Ryzen/Radeon)

AMD laptops come with several components:

**AMD Chipset Driver** - Essential, manages power states and CPU features

**AMD Radeon Software (Adrenalin)** - Optional GUI app for:

- GPU settings, color profiles
- Game optimization
- Recording/streaming (ReLive)
- Performance overlay

**Background processes:**
| Process | Purpose | Safe to disable? |
|---------|---------|------------------|
| `RadeonSoftware.exe` | Main UI | Yes (launch manually when needed) |
| `AMDRSServ.exe` | Hotkeys, overlay | Yes |
| `aaborker.exe` | Telemetry | Yes |

**Minimal install:** AMD installer lets you install only the driver without Radeon Software GUI. Closer to Linux experience.

**Disabling startup:** GPU works fine without Radeon Software running. Only lose overlay/hotkeys/auto-updates until you launch it manually.

## Common Audio Issues

Audio glitches (crackling, dropouts) are common on Windows. Causes:

1. **DPC Latency** - Poorly written drivers cause audio buffer underruns
   - Diagnose with [LatencyMon](https://www.resplendence.com/latencymon)
   - Common culprits: Wi-Fi drivers, GPU drivers, USB drivers

2. **Wrong sample rate** - Mismatch between Windows and hardware
   - Right-click speaker → Sound settings → Output device → Format
   - Try 24-bit, 48000 Hz (common default)

3. **Audio enhancements** - Can cause artifacts
   - Sound settings → Audio enhancements → Off

4. **Hardware acceleration conflicts** - Chrome/browser specific
   - `chrome://settings/system` → Disable hardware acceleration

5. **Power management** - Aggressive power saving causes latency
   - Try High Performance power plan temporarily

## Windows Update and Drivers

Windows Update includes drivers but:

- Only WHQL-certified "stable" versions (often outdated)
- May install generic drivers instead of OEM-specific
- Some updates are under "Optional updates" (not auto-installed)

To see pending driver updates:
Settings → Windows Update → Advanced options → Optional updates → Driver updates

## Email Notifications for Driver Updates

Dell (and other OEMs) offer email subscriptions for new driver releases:

- Dell: On support page → "ドライバー サブスクリプション" / "Driver subscription"

This avoids needing to check manually or run SupportAssist.
