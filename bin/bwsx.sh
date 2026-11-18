#!/bin/sh
# Run a command with Bitwarden Secrets Manager secrets as environment variables.
# The machine account behind the token decides which secrets the command gets.
#
#   bwsx 'curl -u "$API_USER:$API_PASS" https://example.com'
#
# bws joins the arguments and runs them with `sh -c`, so quote the command as one
# string and let the inner shell expand the variables. bws removes the token from
# the command's environment.

set -e

token_file="${XDG_CONFIG_HOME:-$HOME/.config}/bws/token"

if [ $# -eq 0 ]; then
  echo "usage: bwsx '<command>'" >&2
  exit 2
fi

if [ ! -r "$token_file" ]; then
  echo "bwsx: no access token at $token_file" >&2
  exit 1
fi

BWS_ACCESS_TOKEN=$(cat "$token_file")
export BWS_ACCESS_TOKEN
exec bws run -- "$@"
