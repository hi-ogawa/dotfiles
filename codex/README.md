# Codex Configuration

User-level config for `~/.codex/`.

## Contents

- `config.toml` - user-level Codex config
- `AGENTS.md` - global instructions loaded into Codex sessions
- `hooks.json` - global Codex hook config
- `notify.sh` - desktop notification hook script

## Goal

Match what Claude does — add a `Co-authored-by` trailer to AI-assisted commits:

```
Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
```

Codex equivalent (built-in default, no model name):

```
Co-authored-by: Codex <noreply@openai.com>
```

## Design

Codex has a built-in commit attribution system (`commit_attribution.rs`) that injects the trailer via model instructions and enforces it appears exactly once. The correct approach is to enable that feature rather than duplicate it via `AGENTS.md` instructions (which would conflict and risk duplicates).

The attribution value (`Codex <noreply@openai.com>`) is the hardcoded default in source. The model name is available in session context but the built-in doesn't expose it — unlike Claude which includes model name dynamically. Accepted limitation for now.

The feature is `UnderDevelopment` and disabled by default, so it requires explicit opt-in via `config.toml`.

## Source of Truth

- `codex-rs/core/src/commit_attribution.rs` — trailer logic, default value, dedup enforcement
- `codex-rs/features/src/lib.rs` — `Feature::CodexGitCommit`, `default_enabled: false`
- `codex-rs/core/src/codex.rs:3661` — feature gate for injection
- `codex-rs/core/src/config/mod.rs:288` — `commit_attribution` config key (empty string disables)

## User-Level Instructions (`AGENTS.md`)

`~/.codex/AGENTS.md` is loaded as system instructions for every Codex session, across all projects. Use it for global policies that should always apply regardless of the project's own `AGENTS.md`.

Codex resolves `AGENTS.md` files in a hierarchy: `~/.codex/AGENTS.md` (lowest priority) → repo root → subdirectory closest to the working files (highest priority). All matched files are concatenated. Note: there are known issues where the global file is not read by default in some versions — see [#960](https://github.com/openai/codex/issues/960).

## Hooks and Notifications

Codex CLI has experimental hooks behind the `codex_hooks` feature flag. See the official hooks reference instead of duplicating the event schema here.

This dotfiles package enables hooks and installs a `Stop` hook that runs `~/.codex/notify.sh`. Local assessment: `Stop` is the closest current hook for desktop notifications, but Codex does not currently expose the same dedicated notification/attention events used by the local Claude and OpenCode setups.

The notification script uses `last_assistant_message` when available, falls back to a generic message, and supports Linux `notify-send`, WSL/Git Bash through PowerShell BurntToast, and macOS `osascript`.

## References

- [Codex hooks](https://developers.openai.com/codex/hooks)
- [Configuration reference](https://developers.openai.com/codex/config-reference)
- [AGENTS.md hierarchy](https://github.com/openai/codex/blob/main/codex-cli/README.md#agentsmd)
