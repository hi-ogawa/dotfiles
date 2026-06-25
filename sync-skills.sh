#!/bin/bash
set -euo pipefail

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
