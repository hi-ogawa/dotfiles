---
name: ho-handoff
description: >-
  Write a focused local handoff for a new coding-agent session. Use only when the user explicitly invokes "ho-handoff".
---

# Local Handoff

Write a self-contained prompt that the user can pick up in a fresh OpenCode session.

## Workflow

1. Use the current working directory as the target directory unless the user specifies another one.
2. Choose a concise semantic slug based on the project and task, such as `dotfiles-session-picker`. Use a slug the user provides. Slugs must contain only lowercase letters, numbers, and single hyphens between words.
3. Resolve the handoff path as `$XDG_DATA_HOME/ho-handoff/<slug>.md`, or `$HOME/.local/share/ho-handoff/<slug>.md` when `XDG_DATA_HOME` is unset. Create its parent directory if needed.
4. Write the handoff directly to that path, replacing a previous handoff with the same slug. Other handoffs must remain unchanged.
5. Tell the user the handoff is ready as `Handoff ready: ho-handoff -s=<slug>`. Do not launch the new session yourself.

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

Prefer a concise authored brief over a transcript or generic summary. Preserve meaningful uncertainty instead of inventing conclusions. Do not investigate or perform the handed-off task unless the user asks.

The user picks up a specific handoff with `ho-handoff -s=<slug>`. Running `ho-handoff` without a slug automatically opens the only pending handoff or shows a picker when multiple handoffs exist. A selected handoff moves out of the pending queue before OpenCode starts; it is deleted after a successful exit or restored after a failed exit.
