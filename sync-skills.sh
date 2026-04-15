#!/bin/bash
set -e

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

pnpm dlx skills add "$SCRIPT_DIR/skills" --all -g "$@"
