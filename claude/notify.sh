#!/bin/bash
# Claude Code notification hook script
# Reads JSON from stdin and shows native notification (Windows/Linux)
#
# Hook input format:
#   { "session_id", "transcript_path", "cwd", "hook_event_name", "message", "notification_type" }

input=$(cat)

# WSL detection
is_wsl() {
  grep -qi microsoft /proc/version 2>/dev/null
}

windows_notify() {
  local input="$1"
  local script_dir="$2"
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
}

case "$(uname -s)" in
  Linux*)
    if is_wsl; then
      # WSL: convert path to Windows format and use Windows notifications
      script_dir=$(wslpath -w "$(cd "$(dirname "$0")" && pwd)")
      windows_notify "$input" "$script_dir"
    else
      # Native Linux
      message=$(echo "$input" | jq -r '.message // "Notification"')
      cwd=$(echo "$input" | jq -r '.cwd // ""')
      project=$(basename "$cwd")
      script_dir=$(cd "$(dirname "$0")" && pwd)
      notify-send -i "$script_dir/claude-icon.png" "Claude Code [$project]" "$message"
    fi
    ;;
  MINGW*|MSYS*|CYGWIN*)
    # Git Bash / MSYS: use pwd -W for Windows path
    script_dir=$(cd "$(dirname "$0")" && pwd -W)
    windows_notify "$input" "$script_dir"
    ;;
esac
