---
name: ho-fresh-eye
description: >-
  Get an independent review from a fresh subagent given only the necessary context. Use only when the user explicitly invokes "ho-fresh" or "ho-fresh-eye".
---

# Fresh Eye

Use a fresh subagent to review a target without inheriting the current agent's reasoning.

## Delegate

Launch one fresh subagent by default. Use multiple only when requested or when assigning distinct review lenses. Start each in a new session and do not expose one subagent's output to another. Give each a minimal, self-contained prompt containing only:

- The exact artifact or decision to inspect.
- The requested deliverable and neutral evaluation criteria.
- Explicit user requirements and objective facts that must be preserved.
- Neutral background facts strictly necessary to interpret the target.

Do not state or imply a preferred conclusion. Do not provide conversation history, prior drafts, rejected alternatives, previous reviews, or the current agent's conclusions. Ask the subagent to inspect the target directly, form its own conclusions, and return recommendations without editing.

## Reconcile

Treat the result as an independent perspective, not as authoritative. Report substantive findings and disagreements while verifying factual claims and noting conflicts with explicit requirements.

Summarize the useful conclusions rather than reproducing the raw output. Edit only when the user explicitly authorizes modifying the target. Verify any edits normally.
