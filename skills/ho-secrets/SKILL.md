---
name: ho-secrets
description: >-
  Read secrets from Bitwarden Secrets Manager with bwsx. Use only when the user explicitly invokes "ho-secrets".
---

# Secrets

`bwsx` is `bws` with this machine's Secrets Manager access token, read from `~/.config/bws/token`. Use it like `bws`, for example `bwsx secret list`.

`bwsx run '<command>'` runs a command with each secret set as an environment variable named after its key. Quote the command as one string, because `bws run` joins its arguments into one `sh -c` script, and single quotes keep your own shell from expanding the variables first. A key that isn't a valid variable name, such as `zamak-password`, is still set, but `$zamak-password` can't reach it, so name secrets in UPPER_SNAKE case.

Prefer `bwsx run` to printing values, because anything printed stays in the transcript. `bwsx secret list` prints values too, so pipe it through `jq -r '.[].key'` to see names only.
