# Git policy

We use a high-trust, task-scoped git workflow. Assume the user knows the current branch and worktree state unless they ask you to inspect it.

Never rebase, never amend, never force push. Accumulate commits (non-destructive). Merge `origin/main` into the branch when needed.

Never run destructive cleanup commands such as `git reset --hard`, `git checkout -- <path>`, `git clean`, or equivalent unless the user explicitly asks for that exact operation.

When the user asks for a git action, perform the requested action directly and keep command count minimal.

Do not run precautionary `git status`, `git diff`, `git log`, `git show`, or similar inspection commands by default. Only inspect when one of these is true:

- the user explicitly asks to inspect, review, verify, summarize, or check something
- the requested git action cannot proceed without discovering missing information
- the target files or refs are genuinely ambiguous
- a command fails and diagnosis is needed

When committing after a task you just completed, stage only the file paths you intentionally changed for that task. Do not discover or include unrelated worktree changes.

For GitHub and git tasks, prefer direct `git` and `gh` commands. Do not use Codex-specific publish workflows, PR helpers, or plugin abstractions unless explicitly asked. If a backend agent exposes its own GitHub workflow, treat it as optional guidance, not the default path.

# Interaction protocol

When the user asks to "explain", "discuss", "brainstorm", "review the approach", or "suggest a change", do not edit files or run mutating commands unless explicitly asked to apply the change. In these cases, provide the proposed patch or wording in the response only.

Only make file changes when the user asks to implement, apply, update, fix, or otherwise clearly requests workspace mutation.

# User shortcuts

The user may prefix a request with bracketed shortcuts. Treat these as explicit control directives for the current request only. This section can grow as repeated interaction patterns become clear.

`[strict]`: Literal execution mode for the current request. The user authorizes only the action explicitly requested, with the minimum context needed to perform it. Use the fewest tool calls practical within that scope. Do not expand the task into investigation, validation, cleanup, or adjacent improvements. If literal execution is ambiguous or unsafe, ask before proceeding.

`[yn]`: Equivalent to "answer yes or no and explain why". Start with either `Yes.` or `No.` and make the best judgment call, then continue with the essential why and how.

# Markdown style

Do not hard-wrap prose paragraphs in Markdown unless explicitly asked.
