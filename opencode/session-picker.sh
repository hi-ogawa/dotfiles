#!/usr/bin/env bash

set -euo pipefail

preview_session() {
  local session_id="$1"
  if [[ ! "$session_id" =~ ^ses_[[:alnum:]]+$ ]]; then
    printf 'Invalid session ID\n'
    return 1
  fi

  opencode db --format json "
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

if [[ "${1:-}" == "--preview" ]]; then
  preview_session "${2:-}"
  exit
fi

for command in opencode jq fzf; do
  if ! command -v "$command" >/dev/null 2>&1; then
    printf 'Missing required command: %s\n' "$command" >&2
    exit 1
  fi
done

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

action="${selection%%$'\n'*}"
selected="${selection#*$'\n'}"
session_id="${selected%%$'\t'*}"

if [[ "$action" == "ctrl-f" ]]; then
  exec opencode --session "$session_id" --fork
fi

exec opencode --session "$session_id"
