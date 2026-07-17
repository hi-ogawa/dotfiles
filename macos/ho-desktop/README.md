# ho-desktop

A UI-less Swift utility for the macOS desktop operations used by this setup:

- `Ctrl+Option+Up`: maximize the focused window.
- `Ctrl+Option+Right`: move the focused window to the next display.

The shortcuts are configured at the top of [`main.swift`](main.swift). Each shortcut can use any combination of `.command`, `.control`, and `.option`.

Run the following commands from the repository root.

## Build And Test

Quit Rectangle before testing so both applications do not register the same shortcuts.

Build and sign the executable:

```sh
python3 macos/ho-desktop/manage.py build
```

Run it directly without installing a LaunchAgent:

```sh
macos/ho-desktop/.build/ho-desktop
```

The first run requests Accessibility access. Grant access to the built executable in System Settings, then run it again. Stop the foreground process with `Ctrl+C`.

Check permissions and display detection without registering the shortcuts:

```sh
macos/ho-desktop/.build/ho-desktop --check
```

## Install

After building, install the executable and per-user LaunchAgent:

```sh
python3 macos/ho-desktop/manage.py install
```

The first install requests Accessibility access and exits. Grant access to `~/.local/bin/ho-desktop`, then run the install command again to start the LaunchAgent.

Check the installed executable and service:

```sh
~/.local/bin/ho-desktop --check
launchctl print gui/$UID/io.github.hi-ogawa.ho-desktop
```

Logs are written under `~/Library/Logs/ho-desktop`.

## Uninstall

```sh
python3 macos/ho-desktop/manage.py uninstall
```
