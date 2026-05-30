# Ported From

This skill is a manual-invocation port of the built-in review workflow from the openai/codex repository:

https://github.com/openai/codex

Source files:

- `codex-rs/core/review_prompt.md`: reviewer rubric and strict finding criteria.
- `codex-rs/core/src/review_prompts.rs`: target prompt generation for current changes, base branches, commits, and custom instructions.
- `codex-rs/core/src/tasks/review.rs`: review task behavior, including one-shot review execution, constrained tools, and output parsing.

The skill intentionally keeps only the portable steering behavior. It does not reproduce the built-in selector UI, review-mode lifecycle events, isolated sub-agent plumbing, or structured transcript persistence.
