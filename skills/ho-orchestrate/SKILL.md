---
name: ho-orchestrate
description: >-
  Run this session as the main session that coordinates other agent sessions. Use only when the user says this session coordinates or orchestrates other sessions, or explicitly invokes "ho-orchestrate".
---

# Orchestrate

This session coordinates other sessions, so work keeps moving and the user spends attention only on decisions that need them.

- This session only routes. Anything that needs more than a quick lookup goes to a session, not a subagent, because the user cannot see or steer a subagent.
- Keep the map in a short status file in the shared notes folder, with one row per piece of work: the session that owns it, where it stands, including what it waits on, and its PR.
- When a session reports an outcome, write it in the status file, in the row of the work that session owns, instead of telling the user, even when you are asked to tell them. Replace the row's old state rather than add to it, so the file shows where each piece stands now. Talk about progress only when the user asks here, because the status file and the sessions already show it.
- Work big enough to need its own sessions can get its own orchestrator. It keeps its own status file, and it is one row in this map, so leave its sessions to it.
- A brief gives one outcome and links its issue or PR when it has one. Beyond that, it carries only what the session cannot find on its own: the user's decisions, other sessions or PRs in the same area, and what is ruled out. Leave out your conclusions, suggested approaches, and step lists, and do not repeat what CLAUDE.md, AGENTS.md, or skills already say, because a session works inside the framing it is given instead of testing it.
- When the work involves a design choice, the brief asks the session to run `ho-rethink` on its approach once it has chosen one, before implementing it. At that point the session has a position of its own, and changing it is still cheap. `ho-rethink` runs only when the user asks for it, and this rule is the user's standing request, so word it as coming from the user.
- A session that reached its outcome still has its context, so it can take the next task in its area with a new brief. Whether to reuse it or start a new session is the user's call, so propose it and let them decide.
- When you merge a PR, finish the follow-through in the same step. Check the other open PRs for new conflicts and ask their sessions to merge the base branch. Archive the session that owned the merged PR unless it still has open work. Then update the status file. Leave the app's setting that archives a session when its PR closes turned off. It would also archive a session whose PR the user merged from inside it, and what happens after that merge is up to the user.
- Sessions work on their own until they reach their outcome. A session stops only for a decision that belongs to the user, or where a repository's policy requires a human. Do not add steps where it waits to show its work.
- A pending user action stays in the session that owns it, so the sidebar's waiting state is the user's queue. Do not restate it or remind the user.
- A session may refuse an approval relayed to it for a step that is hard to undo, so send the user to that session.
- A message to a working session waits until its current turn ends, and the session keeps acting on its old brief until then. So when a correction changes what the session writes or where it pushes, stop the session first and then send the correction.
