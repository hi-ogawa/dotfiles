#!/bin/bash
# Codex notification hook script
# Reads Codex hook JSON from stdin and shows a native desktop notification.

input=$(cat)

is_wsl() {
  grep -qi microsoft /proc/version 2>/dev/null
}

json_get() {
  local query="$1"
  local fallback="$2"
  if command -v jq >/dev/null 2>&1; then
    echo "$input" | jq -r "$query // \"$fallback\"" 2>/dev/null || printf '%s\n' "$fallback"
  else
    printf '%s\n' "$fallback"
  fi
}

truncate_message() {
  local message="$1"
  local limit="${2:-240}"
  if ((${#message} > limit)); then
    printf '%s...\n' "${message:0:limit-3}"
  else
    printf '%s\n' "$message"
  fi
}

windows_notify() {
  local input_b64="$1"
  powershell.exe -NoProfile -Command "
    \$jsonText = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('$input_b64'))
    \$json = \$jsonText | ConvertFrom-Json
    \$message = if (\$json.last_assistant_message) { \$json.last_assistant_message } elseif (\$json.message) { \$json.message } else { 'Codex finished' }
    if (\$message.Length -gt 240) { \$message = \$message.Substring(0, 237) + '...' }
    \$cwd = \$json.cwd
    \$project = if (\$cwd) { Split-Path \$cwd -Leaf } else { '' }
    \$title = if (\$project) { \"Codex [\$project]\" } else { 'Codex' }
    \$text1 = New-BTText -Content \$title
    \$text2 = New-BTText -Content \$message
    \$binding = New-BTBinding -Children \$text1, \$text2
    \$visual = New-BTVisual -BindingGeneric \$binding
    \$content = New-BTContent -Visual \$visual -ActivationType Protocol
    Submit-BTNotification -Content \$content
  " >/dev/null 2>&1 || true
}

message=$(json_get '.last_assistant_message // .message // .hook_event_name' 'Codex finished')
message=$(truncate_message "$message")
cwd=$(json_get '.cwd' '')
project=$(basename "$cwd")
if [[ -n "$project" ]]; then
  title="Codex [$project]"
else
  title="Codex"
fi

case "$(uname -s)" in
  Linux*)
    if is_wsl; then
      input_b64=$(printf '%s' "$input" | base64 | tr -d '\n')
      windows_notify "$input_b64"
    else
      notify-send -h string:sound-name:message-new-instant "$title" "$message" >/dev/null 2>&1 || true
    fi
    ;;
  Darwin*)
    osascript -e "display notification \"${message//\"/\\\"}\" with title \"${title//\"/\\\"}\"" >/dev/null 2>&1 || true
    ;;
  MINGW*|MSYS*|CYGWIN*)
    input_b64=$(printf '%s' "$input" | base64 | tr -d '\n')
    windows_notify "$input_b64"
    ;;
esac
