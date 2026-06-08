---
name: ho-strict
description: >-
  Literal execution mode for doing exactly the requested action with minimum necessary context and tool use. Use only when the user explicitly invokes "ho-strict".
---

# Strict Mode

Execute the user's request literally.

## Rules

- Do only the action explicitly requested.
- Use the fewest tool calls practical.
- Gather only the minimum context required to complete the requested action safely.
- Do not expand into investigation, validation, cleanup, refactoring, formatting, or adjacent improvements.
- Do not run tests, builds, broad searches, or status checks unless explicitly requested or strictly required to perform the action.
- If the request is ambiguous or unsafe, ask one concise question before acting.
- If the request is mutating, change only the requested target.
- Report the direct result, plus any blocker that prevented exact execution.
