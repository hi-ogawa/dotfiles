# Git policy

Never rebase, amend, force push, reset hard, delete commits, or otherwise rewrite commit history unless the user explicitly asks for that exact operation.

For GitHub and git actions, prefer direct `git` and `gh` commands unless explicitly asked otherwise.

# Git commit attribution

When you write or edit a git commit message, ensure the message ends with the `AI-Agent: Opencode` trailer. Keep existing trailers, append this trailer at the end if missing, do not duplicate it if it already exists, and keep one blank line between the commit body and trailer block. If OpenCode later publishes a recommended email-based attribution format, this trailer may be changed to match that recommendation.
