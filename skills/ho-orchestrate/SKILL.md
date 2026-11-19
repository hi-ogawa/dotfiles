---
name: ho-orchestrate
description: >-
  Run this session as the main session that coordinates other agent sessions. Use only when the user says this session coordinates or orchestrates other sessions, or explicitly invokes "ho-orchestrate".
---

# Orchestrate

The user drives several streams of work at once. Other sessions do the work, and this session holds the whole picture. The goal is that work keeps moving and the user spends attention only on decisions that need them.

## Scope

The user sets the scope, such as several repositories, one repository, or one hard task within a repository. The map covers that scope.

## Keep the map

Know what is in flight: open issues and PRs, running sessions, and what the user cares about most. Rebuild it from its sources, such as `gh` and the session list, rather than from memory, because both change while you work.

Triage each new task against the map. Check whether an issue already covers it, what it overlaps, and the history of the code it touches, such as an earlier change it undoes or extends. Discuss a new idea here first, write the issue, and then start a session.

Overlap between PRs does not hold back work, as ho-pr says. Once the PRs exist, point out overlaps and ordering questions to the user. When one of two overlapping PRs lands, tell the other PR's session to merge `main`. Across repositories, an overlap is a dependency, such as a change one repository needs from another.

## Move the work

Each piece of work that lands on its own gets a session, which runs to the piece's outcome, such as a merged PR. Work whose result comes back to this session, such as exploring code or one part of a hard task, goes to a subagent. When the scope is one task, parts that land on their own form a stack rather than unrelated PRs. Grounding, a design discussion, or a mockup are checkpoints where the session waits for the user, not where it stops.

A brief gives the goal, pointers to start from, constraints, and the checkpoints. Label a guess as a guess, so the session checks it instead of inheriting it. Before starting a session that may change code, load ho-worktrees and follow its section on starting another session.

Decide who steers each session when it starts. When the user steers it, report its status and leave its questions to the user. When it is delegated to this session, answer routine questions, check its results, and bring the user only the real decisions.

When a session stops, work out what it waits on: the user, another session, or nothing because it is done. Then route it, so no session sits idle without a reason.

## Spend the user's attention well

Bring the user one decision at a time, with what they need to make it and a recommendation. Report outcomes in a line or two and leave out state the user can already see.

Pass on the user's decisions exactly, quoting their words. If an extra step seems worth it, suggest it rather than adding it.

Act on an approval the user gives here. A session may refuse an approval relayed to it for a step that is hard to undo, such as a merge, so when the session needs the approval itself, send the user there.

When a short reply could apply to more than one session, say which one you assumed.

## Stay light

This session keeps the map only while its own context stays small. Quick reads, status checks, small text edits on GitHub, and acting on the user's approvals happen here. Exploring code, changing it, and long waits go to sessions or subagents. When the scope is one task, this session also holds the design.

## Close the loop

Every loose end has one owner. When a PR lands, update whatever depended on it, suggest archiving its session, and check the map for what to start next.
