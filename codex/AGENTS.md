# Git policy

Never rebase, amend, force push, reset hard, delete commits, or otherwise rewrite commit history unless the user explicitly asks for that exact operation.

For GitHub and git actions, prefer direct `git` and `gh` commands unless explicitly asked otherwise.

# Git commit attribution

When you write or edit a git commit message, ensure the message ends with this trailer exactly once:
Co-authored-by: Codex <noreply@openai.com>

Rules:
- Keep existing trailers and append this trailer at the end if missing.
- Do not duplicate this trailer if it already exists.
- Keep one blank line between the commit body and trailer block.

# Interaction protocol

When the user asks to "explain", "discuss", "brainstorm", "review the approach", or "suggest a change", do not edit files or run mutating commands unless explicitly asked to apply the change. In these cases, provide the proposed patch or wording in the response only.

Only make file changes when the user asks to implement, apply, update, fix, or otherwise clearly requests workspace mutation.

# User shortcuts

The user may prefix a request with bracketed shortcuts. Treat these as explicit control directives for the current request only. This section can grow as repeated interaction patterns become clear.

`[strict]`: Literal execution mode for the current request. The user authorizes only the action explicitly requested, with the minimum context needed to perform it. Use the fewest tool calls practical within that scope. Do not expand the task into investigation, validation, cleanup, or adjacent improvements. If literal execution is ambiguous or unsafe, ask before proceeding.

`[yn]`: Equivalent to "answer yes or no and explain why". Start with either `Yes.` or `No.` and make the best judgment call, then continue with the essential why and how.

# Markdown style

Do not hard-wrap prose paragraphs in Markdown unless explicitly asked.
