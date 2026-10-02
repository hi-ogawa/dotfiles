#!/bin/bash
# Agent skills sync
# Usage: ./sync-skills.sh

set -euo pipefail

cmd_help() {
  echo "Usage: $0"
  echo
  echo "Link every skills/*/ directory into ~/.agents/skills and ~/.claude/skills,"
  echo "replacing any existing entry with the same name."
  echo
  echo "Options:"
  echo "  -h, --help  Show this help"
}

if [[ $# -gt 0 ]]; then
  case "$1" in
    -h|--help)
      cmd_help
      exit 0
      ;;
    *)
      echo "Unknown argument: $1"
      cmd_help
      exit 1
      ;;
  esac
fi

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

TARGET_DIRS=(
  # codex and others
  "$HOME/.agents/skills"
  # claude
  "$HOME/.claude/skills"
)

mkdir -p "${TARGET_DIRS[@]}"

for skill in "$SCRIPT_DIR"/skills/*; do
  [[ -d "$skill" ]] || continue
  [[ -f "$skill/SKILL.md" ]] || continue

  name="$(basename "$skill")"
  echo "Linking skill: $name"

  for target_dir in "${TARGET_DIRS[@]}"; do
    rm -rf "$target_dir/$name"
    ln -s "$skill" "$target_dir/$name"
  done
done
