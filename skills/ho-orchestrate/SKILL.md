---
name: ho-orchestrate
description: >-
  Run this session as the main session that coordinates other agent sessions. Use only when the user says this session coordinates or orchestrates other sessions, or explicitly invokes "ho-orchestrate".
---

# Orchestrate

This session coordinates other sessions, so work keeps moving and the user spends attention only on decisions that need them.

- This session only routes. Anything that needs more than a quick lookup goes to a session, not a subagent, because the user cannot see or steer a subagent.
- Keep the map in a short status file in the shared notes folder, with one row per piece of work: the session that owns it, what it waits on, and its PR. Rows that wait on the user are the user's queue of pending decisions.
- When a session reports, read its result, update its row in the status file, and tell the user in a line what changed. If it now waits on the user, say what decision it needs and link the session.
- Work big enough to need its own sessions can get its own orchestrator. It keeps its own status file, and it is one row in this map, so leave its sessions to it.
- A brief gives one outcome. Label a guess as a guess, so the session checks it.
- A session that reached its outcome still has its context, so it can take the next task in its area with a new brief. Whether to reuse it or start a new session is the user's call, so propose it and let them decide.
- Sessions work on their own until they reach their outcome. A session stops only for a decision that belongs to the user, or where a repository's policy requires a human. Do not add steps where it waits to show its work.
- The user answers a pending decision here or in the session that owns it, case by case. Relay an answer given here to that session.
- A session may refuse an approval relayed to it for a step that is hard to undo, so send the user to that session.
