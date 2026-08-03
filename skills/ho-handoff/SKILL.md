---
name: ho-handoff
description: >-
  Write a focused local handoff for a new coding-agent session. Use only when the user explicitly invokes "ho-handoff".
---

# Local Handoff

Write an initial prompt that the user can pick up in a fresh interactive OpenCode session.

## Workflow

1. Use the current working directory as the target directory unless the user specifies another one.
2. Choose a concise semantic slug based on the project and task, such as `dotfiles-session-picker`. Use a slug the user provides. Slugs must contain only lowercase letters, numbers, and single hyphens between words.
3. Resolve the handoff path as `$XDG_DATA_HOME/ho-handoff/<slug>.md`, or `$HOME/.local/share/ho-handoff/<slug>.md` when `XDG_DATA_HOME` is unset. Create its parent directory if needed.
4. Author and write the handoff using the format and guidance below. Replace a previous handoff with the same slug; leave other handoffs unchanged.
5. Tell the user `Handoff ready: ho-handoff -s=<slug>`. The user can run that command to select this handoff, or run `ho-handoff` to open the only pending handoff or choose among multiple handoffs. The command claims the selected handoff before launching OpenCode, deletes it after a successful exit, and restores it after a failed exit. Do not launch the new session yourself.

## File Format

Use this exact structure:

```markdown
cwd: /absolute/path/to/target

<handoff prompt>
```

## Authoring Guidance

Author `<handoff prompt>` as a concise, task-specific opening message for a fresh interactive agent rather than a transcript or generic summary. Carry forward the user's intent and any context from the current conversation that the new agent could not recover from the workspace, such as prior decisions, current work state, meaningful uncertainty, or important constraints. Give the agent enough context to start in the right place, while leaving recoverable details and follow-up questions to the new session. Use whatever structure best fits the task, and do not investigate or begin the handed-off task merely to make the prompt more complete unless the user asks.
