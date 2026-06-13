# Media & Content Creation Workflow

Bass cover recording and production workflow on Windows 11.

## Overview

Complete workflow from recording to publishing:

1. **Video Recording** - Webcam capture with OBS
2. **Audio Production** - Bass recording, mixing, and MIDI transcription
3. **Notation Video** - Creating scrolling notation visualization
4. **Video Editing** - Compositing and final assembly
5. **Publishing** - Export and upload to YouTube/Instagram

## TL;DR - Software Installation

```powershell
# Video recording
winget install -e --id OBSProject.OBSStudio

# Video editor
winget install -e --id KDE.Kdenlive
# Alternative: DaVinci Resolve (more stable on Windows)

# Notation software
winget install -e --id Musescore.Musescore

# Backing track downloader (requires ffmpeg for audio conversion)
scoop install yt-dlp ffmpeg
```

**Manual downloads (required):**

- **Focusrite drivers** - https://focusrite.com (includes ASIO drivers) - **reboot after install**
- **Ableton Live Lite** - Bundled with Scarlett (serial key in Focusrite account)
- **MeldaProduction Free Bundle** - https://meldaproduction.com/MFreeFXBundle
  - Install to: `C:\Program Files\VstPlugins\MeldaProduction`

## Hardware Setup

### Audio Interface

- **Focusrite Scarlett** (2i2, Solo, or similar)
- Direct monitoring capability for zero-latency playing
- ASIO driver support for low-latency recording

### Webcam

- **Logitech C920n** (or similar 1080p webcam)
- Static positioning for bass playing
- USB connection

## Software Installation

```powershell
# Audio interface drivers
# Download from focusrite.com - includes Focusrite Control + ASIO drivers
# Reboot after installation

# DAW - Ableton Live Lite (bundled with Scarlett)
# Serial key available in Focusrite account
# Alternative: Reaper, Cakewalk (both free/affordable)

# Video recording
winget install -e --id OBSProject.OBSStudio

# Audio plugins - MeldaProduction Free Bundle
# Download from meldaproduction.com/MFreeFXBundle
# Install to: C:\Program Files\VstPlugins\MeldaProduction

# Backing track downloader
winget install -e --id yt-dlp.yt-dlp

# Video editor
winget install -e --id KDE.kdenlive
# Alternative: DaVinci Resolve (more stable, steeper learning curve)

# Notation software
# MuseScore (web-based, or download desktop app)
```

## 1. Video Recording Setup (OBS)

### Initial Configuration

#### Camera Setup

1. Launch OBS Studio
2. Add Video Capture Device:
   - Sources → Add → Video Capture Device
   - Device: Select "Logitech HD Pro Webcam C920"

#### Resolution Configuration

**Important:** C920n requires manual resolution setup on Windows.

1. Right-click Video Capture Device → Properties
2. Configure:
   - Resolution/FPS Type: **Custom** (type it manually if needed)
   - Resolution: **1920x1080**
   - FPS: **30**
   - Video Format: **MJPEG** (not H.264)
   - YUV Color Space: 709

_Note: Custom resolution is normal workaround for C920 driver issues on Windows_

#### Camera Controls (Static Bass Recording)

Disable auto-focus and auto-exposure for stable recording:

1. Right-click Video Capture Device → Properties
2. Click **Configure Video** button
3. **Camera Control** tab:
   - Focus: Uncheck "Auto", adjust slider to your playing distance
4. **Video Proc Amp** tab:
   - Exposure: Uncheck "Auto", set for your room lighting
   - White Balance: Uncheck "Auto", set for room temperature

_Settings may reset on OBS restart - verify before each recording session_

#### Output Settings

1. Settings → Video:
   - Base (Canvas) Resolution: 1920x1080
   - Output (Scaled) Resolution: 1920x1080
   - Common FPS Values: 30

2. Settings → Output → Recording:
   - Recording Path: Set to your project folder
   - Recording Format: mp4
   - Encoder: x264 or hardware encoder (NVENC/QuickSync if available)

### Recording Workflow

1. Start OBS
2. Verify camera settings (focus/exposure locked)
3. Position yourself in frame
4. Click "Start Recording"
5. Perform bass cover
6. Click "Stop Recording"
7. File saved to configured path

## 2. Audio Production

### Project Folder Setup

Create dedicated folder per song:

```powershell
mkdir D:\Projects\song-name
cd D:\Projects\song-name
```

Keep everything here: backing track, recordings, DAW project, exports - enables easy migration to external drive.

### Download Backing Track

```powershell
# From project folder
yt-dlp -x --audio-format wav <youtube-url>
```

Downloads audio-only WAV file to current directory.

### Ableton Live Lite Setup

#### Audio Settings (First Time)

1. Preferences (Ctrl+,) → Audio
2. Audio Device: **Focusrite USB ASIO**
3. Sample Rate: **44100 Hz**
4. Buffer Size: **128 samples** (adjust if needed - lower = less latency, higher = more stable)
5. Test: You should see Scarlett inputs/outputs listed

#### Recording Session

1. **Import backing track:**
   - Drag WAV file onto Ableton track
   - Or: File → Import Audio → select file

2. **Set project tempo:**
   - Top bar shows tempo (120.000 BPM default)
   - Enable "Warp" on backing track clip (click clip, bottom panel)
   - Ableton auto-detects tempo, or set manually
   - For transcription later: Tap tempo button while playing along

3. **Create audio track for bass:**
   - Ctrl+T (Insert Audio Track)
   - Input dropdown: Select Scarlett input channel (usually "1 - Inst 1")
   - Monitor: Set to "In" (software monitoring) or "Off" (use hardware direct monitor)
   - Arm track: Click red record button

4. **Test monitoring:**
   - Play bass - should see meters moving
   - Hear yourself through headphones (software or hardware monitor)
   - Adjust input gain on Scarlett interface (clean signal, no clipping)

5. **Record:**
   - Click main transport record button (top)
   - Click play (spacebar)
   - Perform bass cover
   - Spacebar to stop

### Mixing & Post-Processing

#### VST Plugin Setup (First Time)

1. Preferences → Plug-Ins → Plug-In Sources
2. Turn ON "Use VST Plug-In Custom Folder"
3. Browse to: `C:\Program Files\VstPlugins`
4. Turn ON "Use VST3 Plug-in System Folder"
5. Click "Rescan"
6. Check Browser → Plug-ins tab - MeldaProduction plugins should appear

#### Mixing Workflow

**Typical signal chain:**

- **Backing track:** EQ (low shelf ~150Hz, kick boost ~60Hz if needed)
- **Bass DI:** EQ (initial trim) → EQ (tweaking) → Compressor → Reverb (minimal)
- **Master:** Limiter/Maximizer

**Adding plugins to tracks:**

1. Select track (click track name)
2. Bottom panel shows device chain
3. Drag plugin from Browser → Audio Effects → [category]
4. Or: Right-click device chain area → select effect

**Recommended plugins (from MFreeFXBundle):**

- **MEqualizer** - parametric EQ (use multiple instances for multi-stage EQ)
- **MCompressor** - transparent compression for evening out finger/slap dynamics
  - Ratio: 3:1 to 4:1 for bass
  - Attack: 5-10ms to catch peaks
  - Release: 100-200ms for sustained notes
- Built-in **Reverb** - presets work well for minimal ambience
- Built-in **Limiter** - master track safety limiting
  - Threshold: Adjust for 1-2 dB gain reduction (safety) or 3-6 dB (louder for streaming)
  - Ceiling: -0.3 dB default

**Live Lite built-ins vs plugins:**

- EQ: Use MEqualizer (Live Lite's EQ is limited)
- Compressor: Built-in is functional, MCompressor is upgrade
- Reverb: Built-in is fine for minimal use
- Limiter: Built-in works for basic mastering

#### Export Audio

1. Select region to export (or entire project)
2. File → Export Audio/Video
3. Save to project folder: `final-mix.wav`
4. Format: WAV, 44100 Hz, 16-bit

### MIDI Transcription (Optional)

If creating notation video:

#### Ableton Transcription Workflow

1. **Create MIDI track:**
   - Insert MIDI Track
   - Don't need instrument - just for visual piano roll reference

2. **Setup for transcription:**
   - Enable metronome (top-left two-dot icon)
   - Uncheck "Enable Only While Recording" to hear during playback
   - Metronome volume: Adjust with headphone knob on Master track

3. **Tempo and warping:**
   - Ensure backing track is warped to correct tempo
   - Global tempo slider affects all warped clips
   - Can temporarily slow down (e.g., 120 → 80 BPM) for transcribing

4. **Loop and transcribe:**
   - Select 2-4 bar section → Ctrl+L (set loop)
   - Loop plays repeatedly
   - Draw notes in piano roll (bottom panel, pencil tool: Ctrl+B)
   - Use "Fold" button to show only used notes
   - Verify by playing along

5. **Piano roll shortcuts:**
   - Ctrl+D - duplicate notes
   - Shift - snap to grid off (fine positioning)
   - Ctrl+E - split clip

6. **Export MIDI:**
   - Right-click MIDI clip → Export MIDI Clip
   - Save to project folder → import to MuseScore

## 3. Notation Video (MuseScore)

1. Import MIDI from Ableton
2. Add notation elements (fingering, dynamics, etc.)
3. MuseScore saves to web (or export locally)
4. Record screen preview as video:
   - Use OBS screen capture or built-in screen recorder
   - Export as `notation-scroll.mp4` to project folder
   - Custom size for overlay in video editor

## 4. Video Editing (kdenlive)

### Project Setup

1. Create project in project folder:
   - File → New → Save project in `D:\Projects\song-name\`
2. Import assets:
   - `bass-recording.mp4` (OBS webcam video)
   - `notation-scroll.mp4` (MuseScore screen recording)
   - `final-mix.wav` (Ableton export)

### Timeline Compositing

1. **Video layers:**
   - Video 1: Webcam footage (`bass-recording.mp4`)
   - Video 2: Notation video (`notation-scroll.mp4`)

2. **Position notation overlay:**
   - Right-click Video 2 clip → Add Effect → Transform
   - Resize/reposition (picture-in-picture or split screen)

3. **Audio sync:**
   - Delete/mute audio from video clips (low quality)
   - Add `final-mix.wav` to audio track
   - Zoom timeline, align by visual waveforms
   - Fine-tune sync by scrubbing

### Performance Tips

- If playback is choppy: Settings → Preview Resolution → lower resolution
- Consider proxy clips for smoother editing (right-click clips → Proxy Clip)

### Export Presets

1. **YouTube (1080p):**
   - Render → H.264
   - Resolution: 1920x1080
   - Bitrate: ~8000 kbps
   - Frame rate: 30 fps

2. **Instagram:**
   - Square: 1080x1080
   - Vertical: 1080x1920
   - Create custom export preset if needed

**Alternative:** DaVinci Resolve

- More stable on Windows than kdenlive (Linux port can be crashy)
- Better GPU acceleration, smoother timeline
- Free version fully featured for this workflow
- Steeper learning curve

## 5. Publishing

- YouTube upload from exported video
- Instagram upload (may need separate export for aspect ratio)
- Thumbnail creation (optional - video editor or image editor)

## Project Organization

### Recommended Structure

```
D:\Projects\song-name\
├── backtrack.wav           # yt-dlp download
├── bass-recording.mp4      # OBS video
├── song-name.als           # Ableton project
├── Samples\                # Ableton auto-creates
├── final-mix.wav           # Ableton export
├── bass-transcription.mid  # MIDI export
├── notation-scroll.mp4     # MuseScore video
├── video-project.kdenlive  # kdenlive project
└── final-output.mp4        # Rendered video
```

**Benefits:**

- All assets in one folder
- Relative paths for DAW and video editor
- Easy to move to external drive: `xcopy D:\Projects\song-name E:\archive\song-name /E /I`
- Reopen projects on external drive - paths stay relative

## Windows-Specific Notes

### Coming from Arch/Linux

- **Audio stack:** ASIO (exclusive access) vs JACK/PipeWire (flexible routing)
  - ASIO is simpler but less flexible
  - Can't easily mix system audio with ASIO interface
- **Plugin ecosystem:** More Windows VST options than Linux
- **DAW availability:** Ableton Live not available on Linux
- **Stability:** Windows audio drivers generally more stable for music production

### obs-asio Plugin (Streaming)

For streaming with separate bass + YouTube/browser audio:

1. Install obs-asio plugin from GitHub releases
2. OBS → Add source: "ASIO Input Capture"
3. Select Scarlett for bass input
4. Desktop Audio captures browser/YouTube
5. Mix levels independently in OBS mixer
6. Right-click ASIO source → Advanced Audio Properties → Monitor: "Monitor and Output" to hear your mix

**Recording vs Streaming:**

- Recording: Skip OBS for audio, use DAW for everything (better quality)
- Streaming: obs-asio bridges ASIO interface + desktop audio

## Troubleshooting

### C920n Resolution Issues

- Symptom: 1920x1080 not in dropdown, or black screen
- Fix: Uninstall Logitech software, use Custom resolution + MJPEG format
- Verify: Unplug/replug USB if black screen persists

### ASIO Latency

- Symptom: Delayed monitoring, can't play along
- Fix: Lower buffer size (Preferences → Audio → 128 or 64 samples)
- Trade-off: Lower = less latency, but more CPU usage and potential crackling

### OBS Camera Settings Reset

- Symptom: Auto-focus/exposure reactivate after restarting OBS
- Fix: Settings saved in Scene Collection, but some cameras reset firmware
- Workaround: Check "Configure Video" before each session

### kdenlive Crashes

- Symptom: Timeline choppy, frequent crashes on Windows
- Fix: Use proxy clips, lower preview resolution
- Alternative: Switch to DaVinci Resolve (more stable on Windows)

### Plugin Manager UAC Prompt

- Symptom: MPluginManager requests admin access every launch
- Fix: Ignore plugin manager - only needed for updates
- Plugins work fine in Ableton without manager running

## Follow-up

- [ ] Test complete workflow end-to-end (record → mix → edit → export)
- [ ] Verify Scarlett monitoring workflow (direct monitor vs software)
- [ ] Test obs-asio for streaming setup
- [ ] Evaluate DaVinci Resolve as kdenlive alternative
- [ ] Create export preset templates for YouTube/Instagram
- [ ] Test project folder migration to external drive
