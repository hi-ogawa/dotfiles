# Laptop Upgrade Guide for Low-Latency Audio

Research for replacing Dell Inspiron 14 5425 (AMD Ryzen 5) with a laptop suitable for low-latency audio work (software pedals via Ableton + Focusrite Scarlett).

## Use Case

**Primary:**

- Bass cover production (hobby) - see [media.md](media.md)
- Software pedals: Ableton + Focusrite Scarlett, low-latency monitoring

**Secondary:**

- Side project development
- Light web browsing

**Not needed:**

- Gaming
- GPU-intensive workloads
- High-end graphics

**Implication:** Integrated graphics (Intel UHD/Iris) is preferred - avoids discrete GPU DPC issues entirely. Opens up lighter, more portable options.

## Why Current Laptop Doesn't Work

See [audio-latency.md](audio-latency.md) for full investigation. Summary:

- Dell Inspiron (2022) + AMD Ryzen 5 has audio glitches at 128-sample buffer
- LatencyMon shows acceptable DPC latency, but glitches persist
- Same setup worked fine on older Intel Dell laptop
- Likely a Dell/AMD-specific driver or firmware issue

## What Makes a Laptop Good for Audio

### DPC Latency

The most critical factor for real-time audio. DPC (Deferred Procedure Call) latency determines if the system can process audio buffers without dropouts.

- **< 500µs** - Excellent, no issues at any buffer size
- **500µs - 1ms** - Good, works well at 128+ samples
- **> 1ms** - Problematic, may need 256+ buffer or cause glitches

### Key Specs

| Spec     | Recommendation                   | Notes                                                                      |
| -------- | -------------------------------- | -------------------------------------------------------------------------- |
| CPU      | Intel preferred for low-latency  | AMD catches up at higher buffer sizes but less efficient at 64-128 samples |
| GPU      | Intel integrated or AMD discrete | NVIDIA drivers known to cause DPC issues                                   |
| RAM      | 16GB minimum                     | 32GB for large projects                                                    |
| Storage  | NVMe SSD                         | For sample streaming                                                       |
| Ports    | Thunderbolt/USB-C                | Low-latency audio interface connection                                     |
| Thermals | Quiet under load                 | Fan noise during recording is a dealbreaker                                |

### Intel vs AMD for Audio

**Intel advantages:**

- More efficient at low buffer sizes (64-128 samples)
- Better tested USB/audio stack
- Historically fewer DPC latency issues

**AMD considerations:**

- Performs well at 256+ buffer sizes
- Newer Ryzen generations improved significantly
- Mobile Ryzen (laptops) more problematic than desktop
- Power management more aggressive, can cause latency spikes

**Verdict:** For low-latency software monitoring (your use case), Intel is safer. AMD desktop can work, AMD mobile (laptops) is riskier.

### NVIDIA GPU Warning

NVIDIA GPU drivers (`nvlddmkm.sys`) are notorious for causing DPC latency issues. Options:

1. Choose laptop with Intel integrated or AMD discrete GPU
2. If NVIDIA, may need to disable GPU or use minimal driver install

## Platform Options

### Option 1: Windows Laptop (Recommended Path)

Keeps your current workflow (Ableton, Windows setup documented in this repo).

**Pros:**

- Familiar ecosystem
- Ableton + VST plugins work
- Can migrate your existing Windows setup

**Cons:**

- DPC latency varies by laptop model
- Need to research specific models carefully
- "Modern Standby" on newer laptops complicates audio optimization

### Option 2: MacBook (Not Considering)

Documented for completeness, but **not a viable option** - staying in Windows/Linux ecosystem.

<details>
<summary>Details (for reference)</summary>

**Pros:**

- Core Audio built into OS - ultra-low latency out of the box
- No ASIO driver complexity
- M-series chips extremely efficient (30% CPU with full session)
- Focusrite Scarlett works natively
- "It just works" reputation for audio

**Cons:**

- Different OS, learning curve
- Some Windows-only VST plugins won't work
- Higher cost
- Locked into Apple ecosystem

**Latency comparison:**

- MacBook M-series + Scarlett: ~16ms round-trip at 128 samples (comparable to Windows)
- Main advantage is reliability, not raw latency numbers

</details>

### Option 3: Specialist Audio Laptop (XMG)

XMG (German company) sells laptops specifically optimized for audio:

- DPC latency tested and guaranteed < 1ms out of the box
- Bloatware-free Windows install
- BIOS and drivers tuned for audio

**Pricing:**

- XMG DJ 15 base: ~€1,100-1,220
- XMG DJ 15 max: ~€1,500
- (Comparable to MacBook Air M4)

**Pros:**

- Purpose-built, guaranteed low latency
- No configuration/troubleshooting needed

**Cons:**

- **Dated hardware** - XMG DJ 15 uses Intel 10th gen (2020), no updates since
- Only available in Europe (shipping to Japan?)
- Paying premium for 5-year-old specs
- XMG's 2024-2025 focus shifted to gaming laptops with NVIDIA GPUs

**Verdict:** Not recommended. Same €1,100-1,500 gets you Intel 13th/14th gen, DDR5, Thunderbolt 4 in a modern ultrabook. The DPC guarantee doesn't justify 5-year-old specs - just verify DPC on NotebookCheck before buying.

## Specific Recommendations

Given the lightweight use case (no gaming/GPU needs), prioritize:

- Intel CPU with integrated graphics (Iris Xe or UHD)
- Portable form factor (13-15")
- Good keyboard for dev work
- Quiet thermals

### Recommended Categories

| Category           | Examples                    | Notes                                                   |
| ------------------ | --------------------------- | ------------------------------------------------------- |
| Business ultrabook | ThinkPad T series, X series | Good keyboards, Intel options, check specific model DPC |
| Used workstation   | ThinkPad P52                | Known good DPC, overkill specs but reliable             |

### Models to Research

| Model                       | Why                       | Check                                |
| --------------------------- | ------------------------- | ------------------------------------ |
| ThinkPad T14s (Intel)       | Portable, business-class  | NotebookCheck DPC, avoid AMD variant |
| ThinkPad X1 Carbon (Gen 9+) | Ultralight, Intel         | Verify DPC on specific gen           |
| Used ThinkPad P52           | Known good, budget option | Availability                         |

**Avoid:**

- ThinkPad P53, X1 Extreme Gen 2 (known DPC issues)
- Dell XPS series (ACPI.sys issues)
- Any AMD mobile CPU (based on current experience)
- Discrete NVIDIA GPU models

## Research Resources

Before buying any Windows laptop, check:

1. **[NotebookCheck DPC Latency Ranking](https://www.notebookcheck.net/DPC-Latency-Ranking-Which-laptops-and-Windows-tablets-offer-the-lowest-latency.504376.0.html)** - Database of tested laptops with latency measurements

2. **[XMG Audio Laptops Deep Dive](https://www.xmg.gg/en/news-deep-dive-audio-laptops-xmg-dpc-latencies/)** - Technical explanation of DPC latency and recommendations

3. **KVR Audio / Gearspace forums** - Search "[laptop model] DPC latency" for real user experiences

4. **Individual reviews** - Look for LatencyMon results in detailed reviews

## Decision Framework

```
Is low-latency software monitoring the primary goal?
├─ Yes (Windows only)
│  ├─ Standard laptop (new)?
│  │  ├─ Check NotebookCheck DPC ranking for candidates
│  │  ├─ Prefer Intel CPU + integrated graphics (avoid NVIDIA)
│  │  └─ Search forums for real-world audio reports
│  └─ Used/older option? → ThinkPad P52 (known good)
└─ No (can use higher buffer/direct monitoring)
   └─ Current laptop may be acceptable with workarounds
```

## Action Items

- [ ] Check NotebookCheck DPC ranking for candidate models
- [ ] Search forums for real-world audio experiences with specific models
- [ ] Define budget range
- [ ] Test before committing if possible (return policy)

## Sources

### General Recommendations

- [Best Laptops for Music Production 2025 - Wavecolab](https://www.wavecolab.com/articles/best-windows-laptops-audio-production-2025)
- [Best Laptops for Music Production - MusicRadar](https://www.musicradar.com/news/best-laptops-for-music-production)
- [RTINGS Best Laptops for Music Production](https://www.rtings.com/laptop/reviews/best/by-usage/music-production)

### DPC Latency Research

- [NotebookCheck DPC Latency Ranking](https://www.notebookcheck.net/DPC-Latency-Ranking-Which-laptops-and-Windows-tablets-offer-the-lowest-latency.504376.0.html)
- [XMG Audio Laptops Deep Dive](https://www.xmg.gg/en/news-deep-dive-audio-laptops-xmg-dpc-latencies/)
- [Gearspace: Building PC for Audio - GPU AMD vs NVIDIA](https://gearspace.com/board/music-computers/1443533-building-pc-audio-gpu-amd-nvidia-better-dpc-latency-2025-what-mobo.html)

### Intel vs AMD

- [KVR Audio: Ryzen 3900X latency and audio interface](https://www.kvraudio.com/forum/viewtopic.php?t=533086)
- [Gearspace: DPC latency problems](https://gearspace.com/board/music-computers/1403897-dpc-latency-problems.html)

### ThinkPad Experiences

- [Elektronauts: Lenovo ThinkPad for productions](https://www.elektronauts.com/t/lenovo-thinkpad-notebook-for-productions/104228?page=3)
- [Lenovo Forums: P52 for Music Production](https://forums.lenovo.com/t5/ThinkPad-P-and-W-Series-Mobile/P52-for-Music-Production-DPC-Latency/td-p/4226922)

### Mac/Focusrite

- [Focusrite: Improving latency on Mac](https://support.focusrite.com/hc/en-gb/articles/208736249-Improving-the-latency-of-your-Focusrite-interface-on-Mac)
- [Focusrite macOS Compatibility](https://support.focusrite.com/hc/en-gb/articles/12033372452754-Focusrite-Compatibility-on-macOS)
