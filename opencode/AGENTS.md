# Git policy

Never rebase, amend, force push, reset hard, delete commits, or otherwise rewrite commit history unless the user explicitly asks for that exact operation.

For GitHub and git actions, prefer direct `git` and `gh` commands unless explicitly asked otherwise.

# Git commit attribution

When you write or edit a git commit message, ensure the message ends with a `Co-authored-by: OpenCode (<model>) <noreply@opencode.ai>` trailer, where `<model>` is the current model name without the provider prefix. For example, `openai/gpt-5.5` becomes `Co-authored-by: OpenCode (gpt-5.5) <noreply@opencode.ai>`. Keep existing trailers, append this trailer at the end if missing, do not duplicate it if it already exists, and keep one blank line between the commit body and trailer block.

# AGENTS.md file references

When an `AGENTS.md` file contains a standalone file reference like `@README.md` or `@docs/rules.md`, read that file before answering or acting.

Resolve relative references relative to the `AGENTS.md` file that contains them.

Do not follow broad directory references or globs. If a referenced file is missing, mention it briefly and continue. Do not recurse beyond one additional referenced file unless the user asks.
