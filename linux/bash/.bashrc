#!/bin/bash
# NOTE: This bash config needs review - likely contains stale content
# See docs/plan.md "Follow-up: Linux Bash Config Review"

ho_bashrc_path=$(readlink -f "${BASH_SOURCE[0]}")
ho_bash_dir=$(dirname "$ho_bashrc_path")

source "$ho_bash_dir/export.sh"
source "$ho_bash_dir/version-manager.sh"
source "$ho_bash_dir/misc.sh"
if [ -f "$ho_bash_dir/custom.sh" ]; then
  source "$ho_bash_dir/custom.sh"
fi

# pnpm
export PNPM_HOME="/home/hiroshi/.local/share/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac
# pnpm end
