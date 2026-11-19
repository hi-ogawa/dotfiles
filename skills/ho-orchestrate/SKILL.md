---
name: ho-orchestrate
description: >-
  Run this session as the main session that coordinates other agent sessions. Use only when the user says this session coordinates or orchestrates other sessions, or explicitly invokes "ho-orchestrate".
---

# Orchestrate

The user drives several streams of work at once. Other sessions do the work, and this session holds the whole picture. The goal is that work keeps moving and the user spends attention only on decisions that need them.

## Keep the map

Know what is in flight within the scope the user sets, such as several repositories, one repository, or one hard task within a repository. This covers open issues and PRs, running sessions, and what the user cares about most. Rebuild it from its sources, such as `gh` and the session list, rather than from memory, because both change while you work.

Write the map to a short status file in the shared notes folder, with one row per piece of work: the session that owns it, what it waits on, and its PR. Tell the user only what changed, in a line.

Triage each new task against the map. Check whether an issue already covers it, what it overlaps, and the history of the code it touches, such as an earlier change it undoes or extends. Discuss a new idea here first, write the issue, and then start a session.

Overlap between PRs does not hold back work, as ho-pr says. Once the PRs exist, point out overlaps and ordering questions to the user. When one of two overlapping PRs lands, tell the other PR's session to merge `main`. Across repositories, an overlap is a dependency, such as a change one repository needs from another.

## Move the work

Each piece of work that lands on its own gets a session, which runs to the piece's outcome, such as a merged PR. Deep work, or work the user may want to watch or steer, also goes to a session, because the user cannot see or steer a background subagent. A subagent is only for a quick lookup whose result this session uses right away. When the scope is one task, parts that land on their own form a stack rather than unrelated PRs.

A brief gives one outcome, pointers to start from, and constraints. A side duty, such as watching CI, belongs to the session that owns that outcome, so it does not go into another session's brief. Label a guess as a guess, so the session checks it instead of inheriting it. Before starting a session that may change code, load ho-worktrees and follow its section on starting another session.

Sessions work on their own until they reach their outcome. A session stops only for a decision that belongs to the user, such as a design choice, or where a repository's policy requires a human, such as a public repository that needs operator approval before posting. Do not add steps where the session waits to show its work to the user.

Decide who steers each session when it starts. When the user steers it, report its status and leave its questions to the user. When it is delegated to this session, answer routine questions, check its results, and bring the user only the real decisions.

When a session stops, work out what it waits on: the user, another session, or nothing because it is done. Then route it, so no session sits idle without a reason.

## Spend the user's attention well

Bring the user one decision at a time, with what they need to make it and a recommendation. Report outcomes in a line or two and leave out state the user can already see.

A pending user action stays in the session that owns it. That session waits on the user, so the sidebar's waiting state is the user's queue of things to do. Do not restate the action in your messages or remind the user about it.

Act on an approval the user gives here. A session may refuse an approval relayed to it for a step that is hard to undo, such as a merge, so when the session needs the approval itself, send the user there.

When a short reply could apply to more than one session, say which one you assumed.

## Stay light

This session keeps the map only while its own context stays small, so it only routes work and the user's decisions. Anything that needs more than a quick lookup goes to a session. When the scope is one task, this session also holds the design.

## Close the loop

Every loose end has one owner. When a PR lands, update whatever depended on it, suggest archiving its session, and check the map for what to start next.
