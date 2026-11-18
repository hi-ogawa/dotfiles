---
name: ho-secrets
description: >-
  Read secrets from Bitwarden Secrets Manager with bwsx. Use only when the user explicitly invokes "ho-secrets".
---

# Secrets

`<skill-dir>/scripts/bwsx.sh`, written `bwsx` below, is `bws` with this machine's Secrets Manager access token, read from `~/.config/bws/token`. Use it like `bws`, for example `bwsx secret list`.

`bwsx run '<command>'` runs a command with each secret set as an environment variable named after its key. Quote the command as one string, because `bws run` joins its arguments into one `sh -c` script, and single quotes keep your own shell from expanding the variables first. A key with a hyphen, such as `api-token`, is still set, but only `printenv api-token` reads it, so prefer keys like `api_token`.

Prefer `bwsx run` to printing values, because anything printed stays in the transcript. `bwsx secret list` prints values too, so pipe it through `jq -r '.[].key'` to see names only.

If `bws` is missing or `bwsx` reports no access token, follow [references/setup.md](references/setup.md).
