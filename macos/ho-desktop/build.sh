#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BUILD_DIR="$SCRIPT_DIR/.build"
BIN_PATH="$BUILD_DIR/ho-desktop"
LABEL="io.github.hi-ogawa.ho-desktop"

mkdir -p "$BUILD_DIR"
swiftc "$SCRIPT_DIR/main.swift" \
  -O \
  -framework AppKit \
  -framework ApplicationServices \
  -framework Carbon \
  -o "$BIN_PATH"

# Signing is part of producing the deployable artifact; `install` preserves it.
codesign --force --sign - --identifier "$LABEL" "$BIN_PATH"
echo "Built $BIN_PATH"
