#!/bin/bash
# Claude Code notification hook script
# Reads JSON from stdin and shows native notification (Windows/Linux)

input=$(cat)

case "$(uname -s)" in
  Linux*)
    # Use jq + notify-send on Linux
    message=$(echo "$input" | jq -r '.message // "Notification"')
    notify-send "Claude Code" "$message"
    ;;
  MINGW*|MSYS*|CYGWIN*)
    # Use PowerShell + BurntToast on Windows
    powershell.exe -c "
      \$json = '$input' | ConvertFrom-Json
      \$message = \$json.message
      if (-not \$message) { \$message = 'Notification' }
      New-BurntToastNotification -Text 'Claude Code', \$message
    "
    ;;
esac
