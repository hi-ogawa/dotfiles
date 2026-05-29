#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

pnpm dlx skills add "$SCRIPT_DIR/skills" -g -y --skill '*' --agent codex claude-code
