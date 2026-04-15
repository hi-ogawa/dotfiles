# Git policy

Never rebase, never amend, never force push. Accumulate commits (non-destructive). Merge `origin/main` into the branch when needed.

For GitHub and git tasks, prefer direct `git` and `gh` commands. Do not use Codex-specific publish workflows, PR helpers, or plugin abstractions unless explicitly asked. If a backend agent exposes its own GitHub workflow, treat it as optional guidance, not the default path.

# Interaction protocol

When the user asks to "explain", "discuss", "brainstorm", "review the approach", or "suggest a change", do not edit files or run mutating commands unless explicitly asked to apply the change. In these cases, provide the proposed patch or wording in the response only.

Only make file changes when the user asks to implement, apply, update, fix, or otherwise clearly requests workspace mutation.

# User shortcuts

The user may prefix a request with bracketed shortcuts. Treat these as explicit control directives for the current request only. This section can grow as repeated interaction patterns become clear.

`[strict]`: Equivalent to "run no other command". Execute only the requested command or command sequence. Do not run exploratory, verification, status, diff, inspection, or follow-up commands unless the requested command itself fails and the error cannot be reported clearly without one.

`[yn]`: Equivalent to "answer yes or no and explain why". Start with either `Yes.` or `No.` and make the best judgment call, then continue with the essential why and how.

# Markdown style

Do not hard-wrap prose paragraphs in Markdown unless explicitly asked.
