# Git policy

Never rebase, amend, force push, reset hard, delete commits, or otherwise rewrite commit history unless the user explicitly asks for that exact operation.

For GitHub and git actions, prefer direct `git` and `gh` commands unless explicitly asked otherwise. This includes reading GitHub resources: to view or summarize an issue, PR, comments, checks, or releases, use `gh` (for example `gh issue view <n> --json` or `gh api`), never WebFetch on a github.com URL. WebFetch scrapes server-rendered HTML and silently drops dynamically loaded content such as comments, so it will make you report discussions as empty when they are not.

# Git commit attribution

When you write or edit a git commit message, ensure the message ends with a `Co-authored-by: OpenCode <noreply@opencode.ai>` trailer. Keep existing trailers, append this trailer at the end if missing, do not duplicate it if it already exists, and keep one blank line between the commit body and trailer block.

# AGENTS.md file references

Standalone file references like `@README.md` or `@docs/rules.md` in an `AGENTS.md` are a common agent convention: most tools (e.g. Codex, Claude) auto-expand them and inline the referenced file. opencode is the exception — it does NOT expand them, so the referenced content never reaches you unless you read it yourself. Do not assume the content is already loaded.

Therefore, before producing your FIRST response in a session, check whether any loaded `AGENTS.md` contains such a reference. If so, you MUST read that file first — even when the user's opening message is a greeting, is incomplete, seems trivial, or looks like a self-contained question you could answer on its own. Whether the message seems answerable without the reference is NOT a reason to skip it: you cannot know the referenced instructions are irrelevant until you have read them. Read first, then answer. Treat an unread reference as unread instructions: do not answer or act until it is read.

Resolve relative references relative to the `AGENTS.md` file that contains them.

Do not follow broad directory references or globs. If a referenced file is missing, mention it briefly and continue. Do not recurse beyond one additional referenced file unless the user asks.

# Markdown style

Do not hard-wrap prose paragraphs in Markdown unless explicitly asked.

# Prose style

Prefer explicit connective words over symbol-based connectives (`—`, `;`, `:`) when expressing a logical relation between clauses, such as cause, contrast, consequence, or elaboration. Name the relation in words (for example `because`, `so`, `but`, `which means`, `for example`) so the sentence structure survives being read aloud. This targets logical connectives only, so keep punctuation for genuinely structural uses such as a colon before a list.
