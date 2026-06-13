# Window Switcher PRD

Minimal GNOME Activities-like launcher for Windows.

## Goal

Single hotkey to unified search: open windows, apps, and system actions.

## Core Features

1. **Hotkey Trigger** - Single key (e.g., Win or configurable) to show/hide
2. **Unified Search** - Single input searches across:
   - Open windows (switch to)
   - Installed apps (launch)
   - System actions (power off, restart, lock, sleep)
3. **Switch/Launch** - Enter/click to activate selected item
4. **Dismiss** - Escape or click outside to close

## Non-Goals

- Virtual desktop management
- Window previews/thumbnails
- System tray integration
- File search

## Technical Approach

### Windows API

**Open Windows**:

```
EnumWindows          - Enumerate all top-level windows
GetWindowText        - Get window title
IsWindowVisible      - Filter visible windows only
SetForegroundWindow  - Switch to selected window
```

**Installed Apps**:

```
// Start Menu shortcuts
%ProgramData%\Microsoft\Windows\Start Menu\Programs\
%AppData%\Microsoft\Windows\Start Menu\Programs\

// Parse .lnk files with IShellLink COM interface
// Or use Shell32 API to enumerate
```

**System Actions**:

```
ExitWindowsEx(EWX_SHUTDOWN)  - Shutdown
ExitWindowsEx(EWX_REBOOT)    - Restart
LockWorkStation()            - Lock screen
SetSuspendState()            - Sleep/Hibernate
```

### Filtering Logic

```csharp
// Windows - Exclude:
// - Invisible windows (IsWindowVisible == false)
// - Windows with empty titles
// - Tool windows (WS_EX_TOOLWINDOW)
// - This app's own window

// Apps - Include:
// - .lnk files from Start Menu paths
// - Extract display name and icon
```

### UI

- Borderless popup window, centered on screen
- Text input at top for search
- Scrollable list of windows below
- Keyboard navigation (Up/Down arrows)
- Minimal styling (dark theme preferred)

### Hotkey Registration

```
RegisterHotKey       - Global hotkey registration
UnregisterHotKey     - Cleanup on exit
```

Alternatively, use low-level keyboard hook for Win key detection.

## Tech Stack Options

| Option        | Pros                     | Cons           |
| ------------- | ------------------------ | -------------- |
| C# + WPF      | Rich UI, easy dev        | Larger binary  |
| C# + WinForms | Simple, small            | Basic UI       |
| C/C++ + Win32 | Tiny binary              | More code      |
| Rust + egui   | Modern, safe, single exe | Learning curve |

**Recommendation**: C# + WPF for quick development, or Rust for minimal binary.

## MVP Scope

1. Alt+Space hotkey (avoid Win key complexity initially)
2. Unified search across:
   - Open windows
   - Start Menu apps (.lnk files)
   - System actions (shutdown, restart, lock, sleep)
3. Fuzzy search filter
4. Enter to activate, Escape to dismiss
5. Single exe, no install

## Future Enhancements

- Window thumbnails
- MRU (most recently used) ordering
- Per-monitor awareness
- Configurable hotkey
- Window close button (Ctrl+W)
- App icons
