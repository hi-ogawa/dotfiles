#!/usr/bin/env bash

set -euo pipefail

# fzf invokes this internal mode whenever the highlighted session changes.
preview_session() {
  local session_id="$1"
  local db_path="${XDG_DATA_HOME:-$HOME/.local/share}/opencode/opencode.db"
  # The ID is interpolated into read-only SQL, so accept only OpenCode's ID shape.
  if [[ ! "$session_id" =~ ^ses_[[:alnum:]]+$ ]]; then
    printf 'Invalid session ID\n'
    return 1
  fi

  # Keep the preview conversational by excluding tool calls and reasoning parts.
  sqlite3 -readonly -json "$db_path" "
    SELECT
      message.time_created AS created,
      json_extract(message.data, '$.role') AS role,
      json_extract(part.data, '$.text') AS text
    FROM part
    JOIN message ON message.id = part.message_id
    WHERE part.session_id = '$session_id'
      AND json_extract(part.data, '$.type') = 'text'
      AND json_extract(message.data, '$.role') IN ('user', 'assistant')
      AND trim(json_extract(part.data, '$.text')) != ''
    ORDER BY part.time_created DESC
    LIMIT 12
  " | jq -r '
    reverse[]
    | "\n\u001b[1;36m" + (.role | ascii_upcase) + "\u001b[0m\n" + .text
  '
}

# Preview mode prints content for fzf instead of opening the interactive picker.
if [[ "${1:-}" == "--preview" ]]; then
  preview_session "${2:-}"
  exit
fi

# Fail with a specific dependency name instead of a later pipeline error.
for command in opencode jq fzf sqlite3; do
  if ! command -v "$command" >/dev/null 2>&1; then
    printf 'Missing required command: %s\n' "$command" >&2
    exit 1
  fi
done

# OpenCode scopes this list to the Git project associated with the current directory.
# The first TSV field stays hidden in fzf but carries the session ID through selection.
sessions="$({ opencode session list --format json -n 100; } | jq -r '
  .[]
  | [
      .id,
      ((.updated / 1000) | localtime | strftime("%Y-%m-%d %H:%M")),
      (.title | gsub("[\\t\\r\\n]"; " ")),
      (.directory | split("/") | last)
    ]
  | @tsv
')"

if [[ -z "$sessions" ]]; then
  printf 'No OpenCode sessions found for this project.\n' >&2
  exit 1
fi

# fzf owns the list, filtering, and live right-hand preview. --expect reports which
# accept key was used so the same selection can support both continue and fork.
script_path="$(realpath "$0")"
selection="$({ printf '%s\n' "$sessions" | fzf \
  --ansi \
  --delimiter=$'\t' \
  --with-nth=2.. \
  --layout=reverse \
  --header='enter: continue | ctrl-f: fork' \
  --prompt='Sessions> ' \
  --preview="$(printf '%q' "$script_path") --preview {1}" \
  --preview-window='right:60%:wrap' \
  --expect=enter,ctrl-f; } || true)"

if [[ -z "$selection" ]]; then
  exit
fi

# --expect emits the action on the first line and the selected TSV row on the second.
action="${selection%%$'\n'*}"
selected="${selection#*$'\n'}"
session_id="${selected%%$'\t'*}"

# Replace the wrapper process so the selected OpenCode TUI owns the terminal directly.
if [[ "$action" == "ctrl-f" ]]; then
  exec opencode --session "$session_id" --fork
fi

exec opencode --session "$session_id"
