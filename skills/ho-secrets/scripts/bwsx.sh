#!/bin/sh
# bws with this machine's access token, read from ~/.config/bws/token.

set -e

token_file="${XDG_CONFIG_HOME:-$HOME/.config}/bws/token"

if [ ! -r "$token_file" ]; then
  echo "bwsx: no access token at $token_file" >&2
  exit 1
fi

BWS_ACCESS_TOKEN=$(cat "$token_file")
export BWS_ACCESS_TOKEN
exec bws "$@"
