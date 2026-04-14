# Git policy

Never rebase, never amend, never force push. Accumulate commits (non-destructive). Merge `origin/main` into the branch when needed.

For GitHub and git tasks, prefer direct `git` and `gh` commands. Do not use Codex-specific publish
workflows, PR helpers, or plugin abstractions unless explicitly asked. If a backend agent exposes its
own GitHub workflow, treat it as optional guidance, not the default path.

Never fork a repository to work around missing push access. If a local clone cannot push to its
configured remote, stop and ask Hiroshi to grant access or send an invitation.
