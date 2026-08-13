# Agent Handoff

Launch a fresh interactive agent session in a named shared workspace window.

## Workflow

Choose a concise semantic name based on the project and task, using lowercase alphanumeric words separated by hyphens. Use the current working directory unless the user specifies another target.

```bash
wtmux run --name <name> --no-wait -C <cwd> -- <agent-command>
```

Use one of these agent commands:

| Agent | Standard | Unrestricted |
| --- | --- | --- |
| OpenCode | `opencode --prompt '<initial-prompt>'` | `opencode --auto --prompt '<initial-prompt>'` |
| Codex | `codex '<initial-prompt>'` | `codex --dangerously-bypass-approvals-and-sandbox '<initial-prompt>'` |
| Claude | `claude '<initial-prompt>'` | `claude --dangerously-skip-permissions '<initial-prompt>'` |

Use an unrestricted command only when the user requests it. Tell the user which named window contains the new session.

## Prompt Guidance

Write the prompt as a concise, task-specific opening message for a fresh agent rather than a transcript or generic summary. Carry forward the user's intent and context that the new agent could not recover from the workspace, such as prior decisions, current work state, meaningful uncertainty, or important constraints.

Give the agent enough context to start in the right place, while leaving recoverable details and follow-up questions to the new session. Do not investigate or begin the handed-off task merely to make the prompt more complete unless the user asks.
