---
name: ho-handoff
description: >-
  Write a focused local handoff for a new coding-agent session. Use only when the user explicitly invokes "ho-handoff".
---

# Local Handoff

Write a self-contained prompt that Hiroshi can pick up in a fresh OpenCode session.

## Workflow

1. Use the current working directory as the target directory unless Hiroshi specifies another one.
2. Resolve the handoff path as `$XDG_DATA_HOME/ho-handoff.md`, or `$HOME/.local/share/ho-handoff.md` when `XDG_DATA_HOME` is unset. Create its parent directory if needed.
3. Write the handoff directly to that path, replacing any previous handoff.
4. Tell Hiroshi the handoff is ready. Do not launch the new session yourself.

Use this exact file structure:

```markdown
cwd: /absolute/path/to/target

<handoff prompt>
```

## Prompt Content

Write for a fresh agent with no access to the current conversation. Include only what it needs to begin useful work:

- The concrete goal or question.
- Relevant decisions and established context.
- Important files, symbols, commands, links, or observed behavior.
- Scope boundaries and actions that are not authorized.
- The expected deliverable.

Prefer a concise authored brief over a transcript or generic summary. Preserve meaningful uncertainty instead of inventing conclusions. Do not investigate or perform the handed-off task unless Hiroshi asks.

Hiroshi picks up the handoff with `ho-handoff`.
