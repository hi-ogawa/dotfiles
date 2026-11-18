#!/bin/bash
# Save a Bitwarden Secrets Manager access token where bwsx.sh reads it.
set -e

token_file="${XDG_CONFIG_HOME:-$HOME/.config}/bws/token"

# read returns nonzero at end of input without a newline, which piped input can hit.
read -rsp "Access token (input hidden): " token || true
echo >&2
# Trim surrounding whitespace, which a paste can carry.
token="${token#"${token%%[![:space:]]*}"}"
token="${token%"${token##*[![:space:]]}"}"
if [ -z "$token" ]; then
  echo "empty token" >&2
  exit 1
fi

mkdir -p "$(dirname "$token_file")"
(umask 077; printf %s "$token" > "$token_file")
echo "Saved a token of ${#token} characters to $token_file." >&2
