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
    script_dir=$(cd "$(dirname "$0")" && pwd)
    notify-send -i "$script_dir/claude-icon.png" "Claude Code [$project]" "$message"
    ;;
  MINGW*|MSYS*|CYGWIN*)
    script_dir=$(cd "$(dirname "$0")" && pwd -W)
    powershell.exe -c "
      \$json = '$input' | ConvertFrom-Json
      \$message = if (\$json.message) { \$json.message } else { 'Notification' }
      \$cwd = \$json.cwd
      \$project = if (\$cwd) { Split-Path \$cwd -Leaf } else { '' }
      \$title = if (\$project) { \"Claude Code [\$project]\" } else { 'Claude Code' }
      \$text1 = New-BTText -Content \$title
      \$text2 = New-BTText -Content \$message
      \$iconPath = '$script_dir/claude-icon.png'
      \$logo = if (Test-Path \$iconPath) { New-BTImage -Source \$iconPath -AppLogoOverride } else { \$null }
      \$binding = if (\$logo) { New-BTBinding -Children \$text1, \$text2 -AppLogoOverride \$logo } else { New-BTBinding -Children \$text1, \$text2 }
      \$visual = New-BTVisual -BindingGeneric \$binding
      \$content = New-BTContent -Visual \$visual -ActivationType Protocol
      Submit-BTNotification -Content \$content
    "
    ;;
esac
