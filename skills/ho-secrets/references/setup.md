# Setup

Install `bws` from the official release rather than the AUR, because the AUR packages have third-party maintainers. Check `gh release list --repo bitwarden/sdk-sm` for the latest `bws-v*` tag.

```bash
d=$(mktemp -d); cd $d
gh release download bws-v2.1.0 --repo bitwarden/sdk-sm \
  -p 'bws-x86_64-unknown-linux-gnu-2.1.0.zip' -p 'bws-sha256-checksums-2.1.0.txt'
grep 'bws-x86_64-unknown-linux-gnu-2.1.0.zip' bws-sha256-checksums-2.1.0.txt | sha256sum -c -
unzip -q bws-x86_64-unknown-linux-gnu-2.1.0.zip
install -m 755 bws ~/.local/bin/bws
cd /; rm -rf $d
```

In the Bitwarden web app, the user creates a machine account for this machine under Secrets Manager, gives it read access to only the projects it needs, and creates an access token for it. The user runs `save-token.sh` in their own terminal and pastes the token at its hidden prompt. It trims whitespace, rejects empty input, and prints the token's length:

```bash
<skill-dir>/scripts/save-token.sh
<skill-dir>/scripts/bwsx.sh project list
```
