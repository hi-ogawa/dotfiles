# Agent Handoff

Launch a fresh interactive agent session in a named shared workspace window.

## Workflow example

```bash
wtmux run --name <name> --no-wait -C <cwd> -- opencode --prompt '<initial-prompt>'
```

Here `<name>` should be a concise semantic name based on the project and task with simple alphanumeric words.

This is for Opencode, but it can apply to any other terminal based coding agent. For yolo mode on opencode, use `opencode --auto` intead.
For Codex, `codex --prompt-something` and `codex --dangeera...`, For claude, `claude <prompt directly` and `claude --dange...`.
TODO: probably table works here.

See following guide for authoring `<initial-prompt>`.

### Prompt Guidance

Write the prompt as a concise, task-specific opening message for a fresh agent rather than a transcript or generic summary. Carry forward the user's intent and context that the new agent could not recover from the workspace, such as prior decisions, current work state, meaningful uncertainty, or important constraints.

Give the agent enough context to start in the right place, while leaving recoverable details and follow-up questions to the new session. Do not investigate or begin the handed-off task merely to make the prompt more complete unless the user asks.
