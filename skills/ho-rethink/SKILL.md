---
name: ho-rethink
description: >-
  Re-evaluate a position the agent is anchored on, such as an implementation defended by its spec, from evidence and first principles, escalating to a fresh subagent when needed. Use only when the user explicitly invokes "ho-rethink".
---

# Rethink

The user thinks you are arguing from history rather than merits, such as defending an implementation because an issue or plan specified it, or holding a conclusion because you reached it earlier.

## Re-evaluate

Set aside where the current choice came from. A spec, plan, or earlier draft written before the implementation, especially one written by an agent, is an earlier guess about the problem, not an authority over it. Restate the problem from the code, the evidence, and the user's actual requirements, and judge the choice from that alone.

If the challenge holds, change the implementation, say which earlier claim was wrong, and point out which part of the spec the change departs from. If the choice still holds, defend it on its merits without citing where it came from.

## Fresh Eye

When the user asks for a fresh review, or the same position has survived several rounds, delegate to a fresh subagent instead. Give it only the target, the deliverable, the user's explicit requirements, and the neutral facts needed to read the target. Do not pass the spec's rationale, prior drafts, rejected alternatives, earlier reviews, or your own conclusions, and do not hint at a preferred answer. Treat its result as an independent perspective, verify its factual claims, and report where it disagrees with you.
