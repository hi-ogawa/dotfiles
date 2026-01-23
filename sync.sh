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
  "claude/claude-icon.png:$HOME/.claude/claude-icon.png"
  "opencode/opencode.json:$HOME/.config/opencode/opencode.json"
  "opencode/notify.js:$HOME/.opencode/plugins/notify.js"
  "opencode/notify-icon.png:$HOME/.opencode/plugins/notify-icon.png"
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
  "claude/claude-icon.png:$HOME/.claude/claude-icon.png"
  "opencode/opencode.json:$HOME/.config/opencode/opencode.json"
  "opencode/notify.js:$HOME/.opencode/plugins/notify.js"
  "opencode/notify-icon.png:$HOME/.opencode/plugins/notify-icon.png"
)

# Detect platform
detect_platform() {
  case "$(uname -s)" in
    Linux*)
      if grep -qi microsoft /proc/version 2>/dev/null; then
        echo "wsl"
      else
        echo "linux"
      fi
      ;;
    MINGW*|MSYS*) echo "windows" ;;
    *) echo "linux" ;;
  esac
}

PLATFORM="$(detect_platform)"

# WSL: get Windows APPDATA path for host-side apps
if [[ "$PLATFORM" == "wsl" ]]; then
  WIN_APPDATA=$(wslpath -u "$(cmd.exe /c 'echo %APPDATA%' 2>/dev/null | tr -d '\r')")
fi

get_files() {
  case "$PLATFORM" in
    linux) printf '%s\n' "${FILES_LINUX[@]}" ;;
    windows) printf '%s\n' "${FILES_WINDOWS[@]}" ;;
    wsl)
      # Use Linux paths, but VSCode goes to Windows host
      printf '%s\n' "${FILES_LINUX[@]}" | while IFS= read -r line; do
        if [[ "$line" == vscode/* ]]; then
          repo_file="${line%%:*}"
          echo "$repo_file:$WIN_APPDATA/Code/User/${repo_file#vscode/}"
        else
          echo "$line"
        fi
      done
      ;;
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

cmd_status() {
  local filters=("$@")
  local matched=0

  while IFS= read -r mapping; do
    repo_rel_path="${mapping%%:*}"
    sys_path="${mapping##*:}"
    repo_path="$SCRIPT_DIR/$repo_rel_path"

    matches_filter "$repo_rel_path" "${filters[@]}" || continue
    matched=1

    if [[ ! -f "$sys_path" ]]; then
      echo -e "${C_CYAN}$repo_rel_path${C_RESET} -> $sys_path ${C_RED}(missing)${C_RESET}"
    elif diff -q "$repo_path" "$sys_path" > /dev/null 2>&1; then
      echo -e "${C_CYAN}$repo_rel_path${C_RESET} -> $sys_path ${C_GREEN}(ok)${C_RESET}"
    else
      echo -e "${C_CYAN}$repo_rel_path${C_RESET} -> $sys_path ${C_RED}(differs)${C_RESET}"
    fi
  done < <(get_files)

  if [[ $matched -eq 0 && ${#filters[@]} -gt 0 ]]; then
    echo "(no files matched filter: ${filters[*]})"
  fi
}

cmd_diff() {
  local filters=("$@")
  local matched=0

  while IFS= read -r mapping; do
    repo_rel_path="${mapping%%:*}"
    sys_path="${mapping##*:}"
    repo_path="$SCRIPT_DIR/$repo_rel_path"

    matches_filter "$repo_rel_path" "${filters[@]}" || continue
    matched=1

    if [[ ! -f "$sys_path" ]]; then
      # system file missing: show what apply would add
      diff -u --color=auto --label "/dev/null" --label "b/$repo_rel_path" /dev/null "$repo_path" || true
      echo
    elif ! diff -q "$repo_path" "$sys_path" > /dev/null 2>&1; then
      # show system -> repo, so + means "what apply would add"
      diff -u --color=auto --label "$sys_path" --label "$repo_rel_path" "$sys_path" "$repo_path" || true
      echo
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
    repo_rel_path="${mapping%%:*}"
    sys_path="${mapping##*:}"
    repo_path="$SCRIPT_DIR/$repo_rel_path"

    matches_filter "$repo_rel_path" "${filters[@]}" || continue
    matched=1

    if [[ -f "$sys_path" ]] && diff -q "$repo_path" "$sys_path" > /dev/null 2>&1; then
      echo -e "${C_CYAN}[$repo_rel_path]${C_RESET} (ok)"
    else
      mkdir -p "$(dirname "$sys_path")"
      cp -f "$repo_path" "$sys_path"
      echo -e "${C_CYAN}[$repo_rel_path]${C_RESET} ${C_GREEN}(applied)${C_RESET}"
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
    repo_rel_path="${mapping%%:*}"
    sys_path="${mapping##*:}"
    repo_path="$SCRIPT_DIR/$repo_rel_path"

    matches_filter "$repo_rel_path" "${filters[@]}" || continue
    matched=1

    if [[ ! -f "$sys_path" ]]; then
      echo -e "${C_CYAN}[$repo_rel_path]${C_RESET} ${C_RED}(missing)${C_RESET}"
    elif diff -q "$repo_path" "$sys_path" > /dev/null 2>&1; then
      echo -e "${C_CYAN}[$repo_rel_path]${C_RESET} (ok)"
    else
      mkdir -p "$(dirname "$repo_path")"
      cp -f "$sys_path" "$repo_path"
      echo -e "${C_CYAN}[$repo_rel_path]${C_RESET} ${C_GREEN}(saved)${C_RESET}"
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
  echo "  status List files with diff state"
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
  status) cmd_status "$@" ;;
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
