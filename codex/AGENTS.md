# Git policy

Never rebase, amend, force push, reset hard, delete commits, or otherwise rewrite commit history unless the user explicitly asks for that exact operation.

For GitHub and git actions, prefer direct `git` and `gh` commands unless explicitly asked otherwise. This includes reading GitHub resources: to view or summarize an issue, PR, comments, checks, or releases, use `gh` (for example `gh issue view <n> --json` or `gh api`), never fetch a github.com URL directly (for example with curl or a web tool). Fetching gets server-rendered HTML and silently drops dynamically loaded content such as comments, so it will make you report discussions as empty when they are not.

Create pull requests as drafts by default.

# Git commit attribution

When you write or edit a git commit message, ensure the message ends with a `Co-authored-by: Codex (<model>) <noreply@openai.com>` trailer, where `<model>` is the model name explicitly identified in your session context. For example, context identifying you as based on GPT-6 yields `Co-authored-by: Codex (GPT-6) <noreply@openai.com>`. If session context does not identify the model, use `Co-authored-by: Codex <noreply@openai.com>`.

# Writing style

Do not hard-wrap prose paragraphs in Markdown.

Prefer explicit connective words over symbol-based connectives (`—`, `;`, `:`) when expressing a logical relation between clauses, such as cause, contrast, consequence, or elaboration. Name the relation in words (for example `because`, `so`, `but`, `which means`, `for example`) so the sentence structure survives being read aloud. This targets logical connectives only, so keep punctuation for genuinely structural uses such as a colon before a list.

When writing instructions, state defaults directly. Avoid redundant exception clauses such as `unless explicitly requested` when an instruction already establishes a default. Keep explicit exceptions when they define safety or permission boundaries.
