#!/bin/bash
# Dotfiles sync
# Usage: ./sync.sh <command> [platform]

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
  "linux/vscode/settings.json:$HOME/.config/Code - Insiders/User/settings.json"
  "linux/vscode/keybindings.json:$HOME/.config/Code - Insiders/User/keybindings.json"
  "linux/claude/settings.json:$HOME/.claude/settings.json"
)

FILES_WINDOWS=(
  "windows/.bash_profile:$HOME/.bash_profile"
  "windows/.bashrc:$HOME/.bashrc"
  "windows/.gitconfig:$HOME/.gitconfig"
  "windows/.gitignore_global:$HOME/.gitignore_global"
  "windows/vscode/settings.json:$APPDATA/Code/User/settings.json"
  "windows/vscode/keybindings.json:$APPDATA/Code/User/keybindings.json"
  "windows/claude/settings.json:$HOME/.claude/settings.json"
)

# Detect platform
detect_platform() {
  case "$(uname -s)" in
    Linux*) echo "linux" ;;
    MINGW*|MSYS*) echo "windows" ;;
    *) echo "linux" ;;
  esac
}

get_files() {
  case "$1" in
    linux) printf '%s\n' "${FILES_LINUX[@]}" ;;
    windows) printf '%s\n' "${FILES_WINDOWS[@]}" ;;
  esac
}

# Colors
C_RESET='\033[0m'
C_BOLD='\033[1m'
C_RED='\033[31m'
C_GREEN='\033[32m'
C_CYAN='\033[36m'

cmd_diff() {
  local platform="$1"
  echo "Platform: $platform"
  echo

  while IFS= read -r mapping; do
    local="${mapping%%:*}"
    target="${mapping##*:}"
    src="$SCRIPT_DIR/$local"
    if [[ -f "$target" ]]; then
      if ! diff -q "$src" "$target" > /dev/null 2>&1; then
        echo -e "${C_BOLD}${C_CYAN}[$local]${C_RESET}"
        echo -e "${C_RED}< $src${C_RESET}"
        echo -e "${C_GREEN}> $target${C_RESET}"
        diff --color=auto "$src" "$target" || true
        echo
      fi
    else
      echo -e "${C_BOLD}${C_CYAN}[$local]${C_RESET}"
      echo -e "${C_GREEN}> $target (missing)${C_RESET}"
      echo
    fi
  done < <(get_files "$platform")
}

cmd_apply() {
  local platform="$1"
  echo "Platform: $platform"
  echo

  while IFS= read -r mapping; do
    local="${mapping%%:*}"
    target="${mapping##*:}"
    src="$SCRIPT_DIR/$local"

    # Check if different
    if [[ -f "$target" ]] && diff -q "$src" "$target" > /dev/null 2>&1; then
      continue
    fi

    echo "[$local] -> $target"
    read -p "Apply? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      mkdir -p "$(dirname "$target")"
      cp -f "$src" "$target"
      echo "Applied."
    else
      echo "Skipped."
    fi
    echo
  done < <(get_files "$platform")

  echo "Done. Run 'source ~/.bashrc' to reload."
}

cmd_save() {
  local platform="$1"
  echo "Platform: $platform"
  echo

  while IFS= read -r mapping; do
    local="${mapping%%:*}"
    target="${mapping##*:}"
    src="$SCRIPT_DIR/$local"

    if [[ ! -f "$target" ]]; then
      echo "[$local] <- $target (not found, skipping)"
      echo
      continue
    fi

    # Check if different
    if diff -q "$src" "$target" > /dev/null 2>&1; then
      continue
    fi

    echo "[$local] <- $target"
    read -p "Save? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      mkdir -p "$(dirname "$src")"
      cp -f "$target" "$src"
      echo "Saved."
    else
      echo "Skipped."
    fi
    echo
  done < <(get_files "$platform")
}

cmd_help() {
  local platform
  platform="$(detect_platform)"
  echo "Usage: $0 <command> [linux|windows]"
  echo
  echo "Commands:"
  echo "  diff   Show differences between repo and system"
  echo "  apply  Copy dotfiles to system (interactive)"
  echo "  save   Copy system configs back to dotfiles (interactive)"
  echo "  help   Show this help"
  echo
  echo "Detected platform: $platform"
}

# Main
COMMAND="${1:-help}"
PLATFORM="${2:-$(detect_platform)}"

case "$PLATFORM" in
  linux|windows) ;;
  *)
    echo "Unknown platform: $PLATFORM"
    exit 1
    ;;
esac

case "$COMMAND" in
  diff)  cmd_diff "$PLATFORM" ;;
  apply) cmd_apply "$PLATFORM" ;;
  save)  cmd_save "$PLATFORM" ;;
  help)  cmd_help ;;
  *)
    echo "Unknown command: $COMMAND"
    cmd_help
    exit 1
    ;;
esac
