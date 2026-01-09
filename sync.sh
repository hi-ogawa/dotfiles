#!/bin/bash
# Dotfiles sync
# Usage: ./sync.sh [diff|apply|save] [linux|windows]

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Detect platform
detect_platform() {
  case "$(uname -s)" in
    Linux*) echo "linux" ;;
    MINGW*|MSYS*) echo "windows" ;;
    *) echo "linux" ;;
  esac
}

PLATFORM="${2:-$(detect_platform)}"

# Define file mappings per platform
case "$PLATFORM" in
  linux)
    FILES=(
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
    ;;
  windows)
    FILES=(
      "windows/.bash_profile:$HOME/.bash_profile"
      "windows/.bashrc:$HOME/.bashrc"
      "windows/.gitconfig:$HOME/.gitconfig"
      "windows/.gitignore_global:$HOME/.gitignore_global"
      "windows/vscode/settings.json:$APPDATA/Code/User/settings.json"
      "windows/vscode/keybindings.json:$APPDATA/Code/User/keybindings.json"
      "windows/claude/settings.json:$HOME/.claude/settings.json"
    )
    ;;
  *)
    echo "Unknown platform: $PLATFORM"
    exit 1
    ;;
esac

cmd_diff() {
  for mapping in "${FILES[@]}"; do
    local="${mapping%%:*}"
    target="${mapping##*:}"
    src="$SCRIPT_DIR/$local"
    if [[ -f "$target" ]]; then
      if ! diff -q "$src" "$target" > /dev/null 2>&1; then
        echo "=== $local <-> $target ==="
        diff --color=auto "$src" "$target" || true
        echo
      fi
    else
      echo "=== $target (missing) ==="
      echo
    fi
  done
}

cmd_apply() {
  for mapping in "${FILES[@]}"; do
    local="${mapping%%:*}"
    target="${mapping##*:}"
    src="$SCRIPT_DIR/$local"
    mkdir -p "$(dirname "$target")"
    cp -vf "$src" "$target"
  done
  echo
  echo "Done. Run 'source ~/.bashrc' to reload."
}

cmd_save() {
  for mapping in "${FILES[@]}"; do
    local="${mapping%%:*}"
    target="${mapping##*:}"
    src="$SCRIPT_DIR/$local"
    if [[ -f "$target" ]]; then
      mkdir -p "$(dirname "$src")"
      cp -vf "$target" "$src"
    else
      echo "skip: $target (not found)"
    fi
  done
}

case "${1:-diff}" in
  diff)  cmd_diff ;;
  apply) cmd_apply ;;
  save)  cmd_save ;;
  *)
    echo "Usage: $0 [diff|apply|save] [linux|windows]"
    echo "  diff  - show differences (default)"
    echo "  apply - copy dotfiles to system"
    echo "  save  - copy system configs back to dotfiles"
    echo
    echo "Platform: $PLATFORM (detected)"
    exit 1
    ;;
esac
