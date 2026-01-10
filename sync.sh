#!/bin/bash
# Dotfiles sync
# Usage: ./sync.sh <command> [filter...]

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Platform file mappings
FILES_LINUX=(
  "linux/bash/.bashrc:$HOME/.bashrc"
  "linux/bash/export.sh:$HOME/.bashrc.d/export.sh"
  "linux/bash/misc.sh:$HOME/.bashrc.d/misc.sh"
  "linux/bash/version-manager.sh:$HOME/.bashrc.d/version-manager.sh"
  "linux/git/.gitconfig:$HOME/.gitconfig"
  "linux/git/.gitignore-global:$HOME/.gitignore-global"
  "vscode/settings.json:$HOME/.config/Code - Insiders/User/settings.json"
  "vscode/keybindings.json:$HOME/.config/Code - Insiders/User/keybindings.json"
  "claude/settings.json:$HOME/.claude/settings.json"
  "claude/notify.sh:$HOME/.claude/notify.sh"
)

FILES_WINDOWS=(
  "windows/.bash_profile:$HOME/.bash_profile"
  "windows/.bashrc:$HOME/.bashrc"
  "windows/.gitconfig:$HOME/.gitconfig"
  "windows/.gitignore_global:$HOME/.gitignore_global"
  "windows/.wezterm.lua:$HOME/.wezterm.lua"
  "vscode/settings.json:$APPDATA/Code/User/settings.json"
  "vscode/keybindings.json:$APPDATA/Code/User/keybindings.json"
  "claude/settings.json:$HOME/.claude/settings.json"
  "claude/notify.sh:$HOME/.claude/notify.sh"
)

# Detect platform
detect_platform() {
  case "$(uname -s)" in
    Linux*) echo "linux" ;;
    MINGW*|MSYS*) echo "windows" ;;
    *) echo "linux" ;;
  esac
}

PLATFORM="$(detect_platform)"

get_files() {
  case "$PLATFORM" in
    linux) printf '%s\n' "${FILES_LINUX[@]}" ;;
    windows) printf '%s\n' "${FILES_WINDOWS[@]}" ;;
  esac
}

# Check if file matches any filter
matches_filter() {
  local file="$1"
  shift
  local filters=("$@")

  # No filters = match all
  if [[ ${#filters[@]} -eq 0 ]]; then
    return 0
  fi

  for f in "${filters[@]}"; do
    if [[ "$file" == *"$f"* ]]; then
      return 0
    fi
  done
  return 1
}

# Colors
C_RESET='\033[0m'
C_BOLD='\033[1m'
C_RED='\033[31m'
C_GREEN='\033[32m'
C_CYAN='\033[36m'

cmd_diff() {
  local filters=("$@")

  while IFS= read -r mapping; do
    rel="${mapping%%:*}"
    sys="${mapping##*:}"
    src="$SCRIPT_DIR/$rel"

    # Skip if doesn't match filter
    matches_filter "$rel" "${filters[@]}" || continue

    if [[ -f "$sys" ]]; then
      if ! diff -q "$src" "$sys" > /dev/null 2>&1; then
        echo -e "${C_BOLD}${C_CYAN}[$rel]${C_RESET}"
        echo -e "${C_RED}< $src${C_RESET}"
        echo -e "${C_GREEN}> $sys${C_RESET}"
        diff --color=auto "$src" "$sys" || true
        echo
      fi
    else
      echo -e "${C_BOLD}${C_CYAN}[$rel]${C_RESET}"
      echo -e "${C_GREEN}> $sys (missing)${C_RESET}"
      echo
    fi
  done < <(get_files)
}

cmd_apply() {
  local filters=("$@")

  while IFS= read -r mapping; do
    rel="${mapping%%:*}"
    sys="${mapping##*:}"
    src="$SCRIPT_DIR/$rel"

    matches_filter "$rel" "${filters[@]}" || continue

    if [[ -f "$sys" ]] && diff -q "$src" "$sys" > /dev/null 2>&1; then
      continue
    fi

    mkdir -p "$(dirname "$sys")"
    cp -f "$src" "$sys"
    echo "[$rel] -> $sys"
  done < <(get_files)

  echo
  echo "Done. Run 'source ~/.bashrc' to reload."
}

cmd_save() {
  local filters=("$@")

  while IFS= read -r mapping; do
    rel="${mapping%%:*}"
    sys="${mapping##*:}"
    src="$SCRIPT_DIR/$rel"

    matches_filter "$rel" "${filters[@]}" || continue

    if [[ ! -f "$sys" ]]; then
      continue
    fi

    if diff -q "$src" "$sys" > /dev/null 2>&1; then
      continue
    fi

    mkdir -p "$(dirname "$src")"
    cp -f "$sys" "$src"
    echo "[$rel] <- $sys"
  done < <(get_files)
}

cmd_help() {
  echo "Usage: $0 <command> [filter...]"
  echo
  echo "Commands:"
  echo "  diff   Show differences between repo and system"
  echo "  apply  Copy dotfiles from repo to system"
  echo "  save   Copy dotfiles from system to repo"
  echo "  help   Show this help"
  echo
  echo "Filter:"
  echo "  Optional patterns to filter files (e.g., 'vscode', 'claude')"
}

# Main
COMMAND="${1:-help}"
shift || true

echo "Platform: $PLATFORM"
echo

case "$COMMAND" in
  diff)  cmd_diff "$@" ;;
  apply) cmd_apply "$@" ;;
  save)  cmd_save "$@" ;;
  help)  cmd_help ;;
  *)
    echo "Unknown command: $COMMAND"
    cmd_help
    exit 1
    ;;
esac
