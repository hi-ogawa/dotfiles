#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LABEL="io.github.hi-ogawa.ho-desktop"
BIN_DIR="$HOME/.local/bin"
BIN_PATH="$BIN_DIR/ho-desktop"
PLIST_DIR="$HOME/Library/LaunchAgents"
PLIST_PATH="$PLIST_DIR/$LABEL.plist"
LOG_DIR="$HOME/Library/Logs/ho-desktop"
DOMAIN="gui/$UID"
BUILD_PATH="$SCRIPT_DIR/.build/ho-desktop"

uninstall() {
  launchctl bootout "$DOMAIN" "$PLIST_PATH" 2>/dev/null || true
  rm -f "$PLIST_PATH" "$BIN_PATH"
  echo "Removed $LABEL"
}

if [[ "${1:-install}" == "uninstall" ]]; then
  uninstall
  exit 0
fi

if [[ "${1:-install}" != "install" ]]; then
  echo "Usage: $0 [install|uninstall]" >&2
  exit 2
fi

"$SCRIPT_DIR/build.sh"

mkdir -p "$BIN_DIR" "$PLIST_DIR" "$LOG_DIR"
install -m 755 "$BUILD_PATH" "$BIN_PATH"

cat > "$PLIST_PATH" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>$BIN_PATH</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <dict>
    <key>SuccessfulExit</key>
    <false/>
  </dict>
  <key>ProcessType</key>
  <string>Interactive</string>
  <key>StandardOutPath</key>
  <string>$LOG_DIR/stdout.log</string>
  <key>StandardErrorPath</key>
  <string>$LOG_DIR/stderr.log</string>
</dict>
</plist>
EOF
plutil -lint "$PLIST_PATH" >/dev/null

if ! "$BIN_PATH" --check; then
  "$BIN_PATH" --request-permission || true
  open "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility"
  echo
  echo "Grant Accessibility access to $BIN_PATH, then run this installer again."
  exit 1
fi

launchctl bootout "$DOMAIN" "$PLIST_PATH" 2>/dev/null || true
launchctl bootstrap "$DOMAIN" "$PLIST_PATH"
echo "Installed and started $LABEL"
echo "Logs: $LOG_DIR"
