#!/bin/bash
# Claude Code notification hook script
# Reads JSON from stdin and shows native notification (Windows/Linux)
#
# Hook input format:
#   { "session_id", "transcript_path", "cwd", "hook_event_name", "message", "notification_type" }

input=$(cat)

case "$(uname -s)" in
  Linux*)
    message=$(echo "$input" | jq -r '.message // "Notification"')
    cwd=$(echo "$input" | jq -r '.cwd // ""')
    project=$(basename "$cwd")
    notify-send "Claude Code [$project]" "$message"
    ;;
  MINGW*|MSYS*|CYGWIN*)
    powershell.exe -c "
      \$json = '$input' | ConvertFrom-Json
      \$message = if (\$json.message) { \$json.message } else { 'Notification' }
      \$cwd = \$json.cwd
      \$project = if (\$cwd) { Split-Path \$cwd -Leaf } else { '' }
      \$title = if (\$project) { \"Claude Code [\$project]\" } else { 'Claude Code' }
      New-BurntToastNotification -Text \$title, \$message
    "
    ;;
esac
