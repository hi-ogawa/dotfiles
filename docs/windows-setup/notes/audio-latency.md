# Audio Latency Issues on Dell/AMD Laptops

Documented issue: Focusrite Scarlett + Ableton Live glitches on Dell Inspiron (2022, Ryzen 5), while same setup worked fine on older Intel system.

See also: [drivers.md](drivers.md) for general Windows audio troubleshooting (sample rate, enhancements, Chrome hardware acceleration, etc.). This note focuses on the specific Dell/AMD issue after standard troubleshooting didn't resolve it.

## Action Plan

### Step 1: Diagnose with LatencyMon

1. Download LatencyMon from resplendence.com/latencymon
2. Start Ableton with Focusrite at 128-sample buffer
3. Run LatencyMon for 5-10 minutes while reproducing glitches
4. Note the driver(s) with highest DPC execution time

### Step 2: Apply targeted fix based on results

| Driver               | Likely cause                | Fix                                                     |
| -------------------- | --------------------------- | ------------------------------------------------------- |
| `dddriver64Dcsa.sys` | Dell Diag Control Device    | Disable in Device Manager, uninstall SupportAssist      |
| `ACPI.sys`           | Dell power management       | Try power plan fixes; may require clean Windows install |
| `amdppm.sys`         | AMD power management        | Disable Cool N Quiet in BIOS, Ultimate Performance plan |
| `nvlddmkm.sys`       | NVIDIA GPU                  | Update/rollback drivers, disable GPU scheduling         |
| `tcpip.sys`          | WSL2/Hyper-V network switch | Disable Hyper-V or unpin WSL folders from Quick Access  |

### Step 3: Re-test

- Run LatencyMon again after applying fix
- Test Ableton at 128-sample buffer
- If still glitching, proceed to next suspected driver

### Step 4: Workaround if no fix works

- Use 256-sample buffer (~27ms round-trip latency) - AMD performs well at this level
- Use direct monitoring on Scarlett for zero-latency playback while recording
- Decision: Is clean Windows install worth it vs. living with 256 buffer?

## Root Cause

Dell laptops have well-documented DPC (Deferred Procedure Call) latency issues affecting real-time audio. AMD Ryzen mobile CPUs compound this with aggressive power management.

**Why older Intel systems work better:**

- Simpler USB 2.0 controllers (more deterministic timing)
- Less aggressive power management
- Fewer background services from OEM bloatware

## Known Culprits

### Dell Bloatware

- **Dell SupportAssist** - performs "deep PIC scan" every 30 minutes causing SMI interrupts that lock the system for seconds
- Dell Diag Control Device (`dddriver64Dcsa.sys`) - identified as highest DPC execution time driver
- Dell Data Vault Control Device - disabling in Device Manager resolves random audio/video freezes

### AMD Power Management

- Aggressive P-state/C-state transitions on Ryzen mobile
- AMD Cool N Quiet (needs disabling in BIOS for accurate DPC measurements)
- Ryzen mobile systems show DPC latency around 1.5ms even with high-performance settings (needs to be under 1ms for stable audio)

### Drivers to Check (via LatencyMon)

- `ACPI.sys` - Dell's implementation causes latency spikes up to 1.6ms+
- `Wdf01000.sys`
- `nvlddmkm.sys` (NVIDIA GPU if present)
- Realtek audio driver conflicts

## Diagnosis

Run LatencyMon for 5-10 minutes while audio glitches occur:

```powershell
# Download from resplendence.com/latencymon
# Look for:
# - Highest DPC execution time drivers
# - Hard pagefault counts
# - Interrupt storm patterns
```

## Fixes

### Quick Tests

1. Try different USB ports (USB-C vs USB-A, different physical controllers)
2. Check Device Manager → USB controllers (AMD vs Intel host controller)
3. Use 256-sample buffer (AMD's sweet spot vs 128 on Intel)

### Dell Bloatware Removal

1. Uninstall Dell SupportAssist completely (disabling services may not be enough as they reactivate)
2. Disable "Dell Diag Control Device" and "Dell Data Vault Control Device" in Device Manager
3. Consider clean Windows install without Dell's image (multiple users report this fixes the issue)

### Power Management

```powershell
# Enable Ultimate Performance power plan
powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61
```

Note: May not work on Windows 11 laptops with Modern Standby. If plan doesn't appear, try:

```powershell
reg add HKLM\System\CurrentControlSet\Control\Power /v PlatformAoAcOverride /t REG_DWORD /d 0
```

- Disable AMD Cool N Quiet in BIOS
- Disable USB selective suspend for all root hubs
- Disable core parking (included in Ultimate Performance plan)

### AMD-Specific

- Uninstall AMD Adrenalin software suite
- Install AMD chipset drivers from AMD's website (includes improved balanced power plan)

## Buffer Size Guidelines

| Buffer Size | One-way @ 44.1kHz | Notes                                    |
| ----------- | ----------------- | ---------------------------------------- |
| 64 samples  | ~1.5ms            | Needs strong CPU, often unstable         |
| 128 samples | ~2.9ms            | Good on Intel, problematic on AMD mobile |
| 256 samples | ~5.8ms            | Recommended for AMD, very stable         |

Note: Actual round-trip latency is much higher due to USB/driver overhead. See Trade-off Decision section for measured values.

AMD CPUs are less efficient at lower buffer sizes and more efficient at higher buffer sizes. At lower buffer sizes, Intel CPUs can use more VST instances/tracks than equivalent AMD. AMD catches up as buffer size increases beyond 128.

## Technical Background

Real-time audio constraint: process N samples before next buffer arrives. Miss deadline = glitch (xrun).

Per-buffer processing chain:

1. USB isochronous transfer delivers samples to driver
2. Driver raises interrupt → context switch to audio thread
3. Process buffer through plugin chain
4. Output buffer back to USB
5. Repeat before next transfer deadline

With 64-sample buffers at 48kHz, you have ~1.3ms for all of this. Context switches on Windows take 0.1-0.5ms alone.

**Why Windows is harder than Linux:**

- Windows scheduler isn't truly real-time (even MMCSS is best-effort)
- DPC latency can block audio interrupts
- No easy way to isolate CPU cores for audio
- Unlike Linux with PREEMPT_RT

## Sources

### Dell DPC Latency Issues

- [Dell laptop & ACPI.SYS high DPC latency problem](https://www.dell.com/community/en/conversations/latitude/dell-laptop-acpisys-high-dpc-latency-problem-warning-for-dell-latitude-users-working-with-low-latency-audio/647f8daef4ccf8a8dee4d8de) - Warning for Dell Latitude users working with low latency audio
- [ACPI.SYS high DPC latency problem](https://www.dell.com/community/en/conversations/latitude/acpisys-high-dpc-latency-problem/6706d213a59b331bdf666db9) - Dell community thread documenting 1.6ms+ latency spikes
- [A major bug in the latest SupportAssist / Dell Diag Control Device](https://www.dell.com/community/Windows-General/A-major-bug-in-the-latest-SupportAssist-Dell-Diag-Control-Device/td-p/4491175) - Documents SupportAssist causing half-second latency spikes every 60 seconds
- [Dell XPS DPC Latency Fix](https://www.dell.com/community/en/conversations/xps/dell-xps-dpc-latency-fix/647f8346f4ccf8a8de2131f4) - Community solutions thread
- [Dell Laptops - Audio Glitches and DPC Latency - a potential solution](https://gearspace.com/board/music-computers/1384919-dell-laptops-audio-glitches-dpc-latency-potential-solution.html) - Gearspace discussion

### AMD Ryzen Audio Performance

- [Ryzen 3900X, latency and audio interface?](https://www.kvraudio.com/forum/viewtopic.php?t=533086) - KVR Audio discussion on AMD vs Intel buffer efficiency
- [DPC latency problems](https://gearspace.com/board/music-computers/1403897-dpc-latency-problems.html) - Gearspace thread on Ryzen mobile ~1.5ms DPC latency
- [Audio laptops with low DPC latencies from XMG](https://www.xmg.gg/en/news-deep-dive-audio-laptops-xmg-dpc-latencies/) - Technical deep dive on laptop audio latency

### Windows Power Management

- [How to Enable the Ultimate Performance Power Plan in Windows 10](https://www.howtogeek.com/368781/how-to-enable-ultimate-performance-power-plan-in-windows-10/) - Guide with GUID and troubleshooting
- [Troubleshooting DPC Latency](https://support.m-audio.com/en/support/solutions/articles/69000803869-troubleshooting-dpc-latency) - M-Audio's guide to DPC latency diagnosis

## Personal Context

**Why this matters:**
The entire motivation for Arch Linux → Windows switch was to move from hardware pedals + direct monitoring to software pedals (Ableton + plugins). If low-latency software monitoring doesn't work reliably on this laptop, the core premise of the Windows migration is undermined.

**Hardware:**

- Dell Inspiron (2022), AMD Ryzen 5
- Focusrite Scarlett Solo (latest gen)
- Same setup worked fine on older Dell laptop (~2020, Intel i5)

**Use case:**

- Bass practice with software effects (not recording/production)
- Single track: tuner → EQ → basic effects
- No playback, just real-time monitoring
- Ableton CPU meter: 10-20% (minimal load)
- YouTube on Chrome for backing tracks (not isolated audio workload)

**Symptoms:**

- Noticeable audio glitches at 128-sample buffer
- Low Ableton CPU (10-20%) rules out DAW processing overhead
- **Plot twist:** Similar glitches occur on built-in speakers with just YouTube (no Focusrite, no DAW)

**Implication:**
This is a system-wide audio issue, not ASIO-specific. Simpler to diagnose: test with just YouTube + built-in speakers + LatencyMon first, before involving Focusrite/Ableton complexity.

**Observation:**
The fact that the same Focusrite + Ableton setup worked on an inferior older Intel system suggests this is Dell/AMD-specific, not a general Windows or Focusrite issue.

### LatencyMon Test Results (2025-01)

**Test condition:** Bass practice context (Focusrite + Ableton + YouTube/Chrome), ~4 minutes

**Result:** LatencyMon reports "system appears to be suitable for handling real-time audio" despite audible glitches occurring during test.

**Key metrics:**

- Highest interrupt to process latency: 718µs (~0.7ms) - under 1ms threshold
- Highest DPC execution time: 732µs from `dxgkrnl.sys` (DirectX Graphics Kernel)
- Hard pagefaults: 2224 across 56 processes

**Unexpected finding:**
DPC latency is NOT showing as the problem. Possible explanations:

1. Hard pagefaults hitting audio processes (LatencyMon flagged this)
2. Intermittent spikes not captured in 4-min session
3. Issue is not DPC-related at all (USB, Chrome audio conflict, Ableton-specific)
4. AMD Cool N Quiet still enabled may affect measurement accuracy

**Processes tab findings:**

- `svchost.exe` has highest pagefaults (558) - system service, not audio
- `AMDRyzenMasterDriverV...` (AMD Software) present
- Various Edge/system processes with pagefaults
- Ableton not in top pagefault list - **pagefaults likely not the cause**

**Next steps:**

- [ ] Run longer session (10+ min) to catch intermittent spikes
- [ ] Test without Chrome to isolate variables
- [ ] Test YouTube-only on built-in speakers (simpler reproduction)
- [ ] Disable AMD Cool N Quiet in BIOS for accurate measurement
- [ ] Research: could AMD Ryzen Master software cause audio issues?
- [ ] Test with Hyper-V/WSL disabled (see WSL/Hyper-V section below)

### Current Conclusion

After standard troubleshooting (see [drivers.md](drivers.md)) and LatencyMon diagnosis showing acceptable metrics, this may be an **undiagnosed hardware/software bug** at some layer:

- Realtek audio driver (Dell/AMD-specific build)
- AMD USB controller + Focusrite interaction
- Windows audio subsystem edge case with this hardware
- BIOS/firmware (Dell Inspiron 14 5425 specific)
- Hyper-V/WSL2 virtualization overhead (if installed)

**Pragmatic options:**

1. Check for BIOS update (currently 1.25.0)
2. Check for Realtek/Focusrite driver updates
3. Try different USB port (USB-C vs USB-A)
4. **Test 256-sample buffer** - not yet confirmed if this fixes glitches
5. **Disable Hyper-V/WSL** - test if virtualization layer is a factor
6. Accept as hardware limitation of this laptop for low-latency audio
7. **Replace laptop** - move Windows setup to Intel-based or audio-friendly hardware

Option 6 is a valid solution. The older Intel laptop worked fine, suggesting Intel or a different AMD system might not have this issue. If software pedals are the core goal, hardware that supports it reliably is worth considering.

**See [laptop-audio-upgrade.md](laptop-audio-upgrade.md) for detailed upgrade research and recommendations.**

### WSL/Hyper-V Impact

WSL2 requires Hyper-V, which may affect real-time audio performance.

**How Hyper-V affects audio:**

- With Hyper-V enabled, Windows runs as a "root partition" on the hypervisor, not directly on hardware
- Adds a layer between hardware interrupts and the Windows kernel
- Microsoft documentation warns: "applications relying on sub-10ms timers such as live music mixing applications...could have issues"

**Known WSL2 bug ([GitHub #7178](https://github.com/microsoft/WSL/issues/7178)):**

- Hyper-V virtual network switch restarts every 2-10 minutes
- Causes `tcpip.sys` DPC spikes up to ~24ms
- Triggers audio stuttering on USB audio devices
- Occurs even when WSL is idle

**Workarounds for the network switch issue:**

- Unpin WSL folders from Quick Access in Explorer
- Remove symlinks pointing to WSL directories from user profile

**To test if Hyper-V is a factor:**

```powershell
# Disable Hyper-V
bcdedit /set hypervisorlaunchtype off
# Reboot, then test audio

# Re-enable after testing
bcdedit /set hypervisorlaunchtype auto
```

**If disabling Hyper-V helps, options:**

1. Use WSL1 instead (no Hyper-V required, worse Linux compatibility)
2. Dual-boot Linux for dev work
3. Keep WSL disabled when doing audio work (`wsl --shutdown` isn't enough - Hyper-V stays active)

**Sources:**

- [WSL GitHub #7178 - Network switch causing audio stuttering](https://github.com/microsoft/WSL/issues/7178)
- [VI-Control - Hyper-V and DAW discussion](https://vi-control.net/community/threads/anyone-ever-run-windows-in-hyper-v.111974/)
- [Microsoft Q&A - Sound stutters with Hyper-V](<https://learn.microsoft.com/en-us/answers/questions/466983/sound-stutters-lags-pops-(on-host-machine)-wheneve>)

### Trade-off Decision

**If 256-sample buffer fixes glitches:**

Actual measured values (Ableton → Preferences → Audio):
| Buffer | Input | Output | Overall |
|--------|-------|--------|---------|
| 256 samples | 12.5ms | 14.5ms | **26.9ms** |
| 128 samples | ? | ? | ~13-14ms (estimate) |

Note: Latency is higher than pure buffer math (5.8ms) due to USB transfer overhead and Focusrite driver buffering.

Using 44.1kHz (48kHz caused issues)

**Impact on bass practice:**

- Low latency matters for feeling "connected" to the instrument
- **~27ms is noticeable** - may feel "disconnected" or laggy
- ~13ms (128 buffer) is generally acceptable threshold for most players
- Personal preference - need to test if the latency feels tolerable

**Musical context (120 BPM reference):**

- 16th note = 125ms
- 27ms latency = ~22% of a 16th note (about 1/5)
- 13ms latency = ~10% of a 16th note (about 1/10)

**Action:** Test at 256 buffer and evaluate:

1. Do glitches disappear?
2. Is the latency feel acceptable for practice?

If both yes → acceptable workaround. If latency feels bad → harder decision.
