# Git policy

Never rebase, never amend, never force push. Accumulate commits (non-destructive). Merge `origin/main` into the branch when needed.

For GitHub and git tasks, prefer direct `git` and `gh` commands. Do not use Codex-specific publish
workflows, PR helpers, or plugin abstractions unless explicitly asked. If a backend agent exposes its
own GitHub workflow, treat it as optional guidance, not the default path.
