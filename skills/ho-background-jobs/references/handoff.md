# Agent Handoff

Launch a fresh interactive OpenCode session in a named shared workspace window.

## Workflow

1. Use the current working directory unless the user specifies another target directory.
2. Choose a concise semantic name based on the project and task, such as `dotfiles-session-picker`. Use a name the user provides. Prefer lowercase letters, numbers, and single hyphens between words.
3. Author a focused initial prompt using the guidance below.
4. Launch the new session immediately:

```bash
wtmux run --name <name> --no-wait -C <cwd> -- opencode --prompt '<initial-prompt>'
```

5. Tell the user which named window contains the new session.

## Prompt Guidance

Write the prompt as a concise, task-specific opening message for a fresh agent rather than a transcript or generic summary. Carry forward the user's intent and context that the new agent could not recover from the workspace, such as prior decisions, current work state, meaningful uncertainty, or important constraints.

Give the agent enough context to start in the right place, while leaving recoverable details and follow-up questions to the new session. Do not investigate or begin the handed-off task merely to make the prompt more complete unless the user asks.

Pass the complete prompt as one `--prompt` argument. Do not create an intermediate handoff file.
