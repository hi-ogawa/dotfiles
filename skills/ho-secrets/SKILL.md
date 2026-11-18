---
name: ho-secrets
description: >-
  Use secrets from Bitwarden Secrets Manager through bwsx without exposing their values. Use only when the user explicitly invokes "ho-secrets".
---

# Secrets

Use secrets from Bitwarden Secrets Manager only through `bwsx`, which runs a command with them as environment variables. `bws` joins the arguments and runs them with `sh -c`, so quote the command as one string and let the inner shell expand the variables:

```sh
bwsx 'curl -u "$API_USER:$API_PASS" https://example.com'
```

Never print a secret's value, because it then stays in the transcript and in your context:

- Never run `bws` directly, because `bws secret get` and `bws secret list` print values, and every `bws` command needs the token.
- Never echo a variable that holds a secret, and never dump the environment.
- Never read `~/.config/bws/token`.

Check that a secret works by using it, not by showing it. If you don't know a secret's name, ask the user.

Never use `bw`, the password manager CLI, because the vault is for the user alone.

If `bwsx` reports no access token, the machine isn't set up yet. Point the user to the Secrets section of the Linux setup guide in the dotfiles repository.
