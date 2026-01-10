#!/bin/bash
# Dotfiles sync
# Usage: ./sync.sh <command> [filter...]

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Platform file mappings
FILES_LINUX=(
  ".bashrc:$HOME/.bashrc"
  ".gitconfig:$HOME/.gitconfig"
  ".gitignore-global:$HOME/.gitignore-global"
  "vscode/settings.json:$HOME/.config/Code - Insiders/User/settings.json"
  "vscode/keybindings.json:$HOME/.config/Code - Insiders/User/keybindings.json"
  "claude/settings.json:$HOME/.claude/settings.json"
  "claude/notify.sh:$HOME/.claude/notify.sh"
)

FILES_WINDOWS=(
  "windows/.bash_profile:$HOME/.bash_profile"
  "windows/.bashrc:$HOME/.bashrc"
  ".gitconfig:$HOME/.gitconfig"
  ".gitignore-global:$HOME/.gitignore-global"
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
  local matched=0

  while IFS= read -r mapping; do
    rel="${mapping%%:*}"
    sys="${mapping##*:}"
    src="$SCRIPT_DIR/$rel"

    matches_filter "$rel" "${filters[@]}" || continue
    matched=1

    if [[ ! -f "$sys" ]]; then
      echo -e "${C_CYAN}[$rel]${C_RESET} ${C_RED}(missing)${C_RESET}"
    elif diff -q "$src" "$sys" > /dev/null 2>&1; then
      echo -e "${C_CYAN}[$rel]${C_RESET} ${C_GREEN}(ok)${C_RESET}"
    else
      echo -e "${C_CYAN}[$rel]${C_RESET} ${C_RED}(differs)${C_RESET}"
      diff --color=auto "$src" "$sys" || true
    fi
  done < <(get_files)

  if [[ $matched -eq 0 && ${#filters[@]} -gt 0 ]]; then
    echo "(no files matched filter: ${filters[*]})"
  fi
}

cmd_apply() {
  local filters=("$@")
  local matched=0

  while IFS= read -r mapping; do
    rel="${mapping%%:*}"
    sys="${mapping##*:}"
    src="$SCRIPT_DIR/$rel"

    matches_filter "$rel" "${filters[@]}" || continue
    matched=1

    if [[ -f "$sys" ]] && diff -q "$src" "$sys" > /dev/null 2>&1; then
      echo -e "${C_CYAN}[$rel]${C_RESET} (ok)"
    else
      mkdir -p "$(dirname "$sys")"
      cp -f "$src" "$sys"
      echo -e "${C_CYAN}[$rel]${C_RESET} ${C_GREEN}(applied)${C_RESET}"
    fi
  done < <(get_files)

  if [[ $matched -eq 0 && ${#filters[@]} -gt 0 ]]; then
    echo "(no files matched filter: ${filters[*]})"
  fi
}

cmd_save() {
  local filters=("$@")
  local matched=0

  while IFS= read -r mapping; do
    rel="${mapping%%:*}"
    sys="${mapping##*:}"
    src="$SCRIPT_DIR/$rel"

    matches_filter "$rel" "${filters[@]}" || continue
    matched=1

    if [[ ! -f "$sys" ]]; then
      echo -e "${C_CYAN}[$rel]${C_RESET} ${C_RED}(missing)${C_RESET}"
    elif diff -q "$src" "$sys" > /dev/null 2>&1; then
      echo -e "${C_CYAN}[$rel]${C_RESET} (ok)"
    else
      mkdir -p "$(dirname "$src")"
      cp -f "$sys" "$src"
      echo -e "${C_CYAN}[$rel]${C_RESET} ${C_GREEN}(saved)${C_RESET}"
    fi
  done < <(get_files)

  if [[ $matched -eq 0 && ${#filters[@]} -gt 0 ]]; then
    echo "(no files matched filter: ${filters[*]})"
  fi
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
