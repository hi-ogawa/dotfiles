# Codex Configuration

User-level config for `~/.codex/`.

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

## References

- [Configuration reference](https://developers.openai.com/codex/config-reference)
- [AGENTS.md hierarchy](https://github.com/openai/codex/blob/main/codex-cli/README.md#agentsmd)
