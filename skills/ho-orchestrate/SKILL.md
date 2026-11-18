---
name: ho-orchestrate
description: >-
  Run a Claude Code desktop session as the main session that coordinates other sessions. Use only when the user says this session coordinates or orchestrates other sessions, or explicitly invokes "ho-orchestrate".
---

# Orchestrate

This session keeps the overall picture and hands the work to other sessions. The app's own instructions for starting sessions cover the mechanics, such as writing a brief, treating a session's note as its report rather than proof, linking sessions, and archiving them. This skill covers what a coordinator decides on top of that.

## Role

Route work, check results, and report. Leave code changes, commits, and actions on accounts or services to the sessions. Small text edits on GitHub are fine here, such as filing an issue or fixing a PR description. When the user approves a step in this session, such as merging a reviewed PR, act on it here.

## Landscape

Before the first task, learn what is already in flight: open issues and PRs, the sessions running, and the project's overview docs. Triage each new task against that rather than on its own.

When an issue undoes or extends an earlier change, read what that change touched, not only what the issue lists.

Discuss a new idea here first. Check whether an issue already covers it, write the issue, and then start a session for it.

## Conflicts between sessions

This session is the only one that sees all the work, so it checks how the pieces interact:

- Before starting a session, check whether an open PR or a running session touches the same files or code. Run one writer at a time on the same files.
- Order dependent work. When one issue rewrites code that another builds on, settle which goes first before either starts.
- When one of two overlapping PRs merges, the other merges `main` and reruns CI before it merges.

## Briefs

A session's endpoint is the task's endpoint, normally a merged PR. Grounding, a design discussion, and a mockup are checkpoints where the session waits for the user. A session stops early only when the user says so.

Give pointers and constraints, not conclusions. Label a guess as a guess, so the session checks it instead of inheriting it.

Decide who steers each session when it starts. When the user steers it, report its status and never answer its questions. When it is delegated to this session, answer routine questions and bring the user only the real decisions.

A session that may change code follows ho-worktrees, so start it in the main worktree without an app worktree and point it to that skill.

## Relaying

Pass on the user's decision exactly, quoting their words. Add no steps they did not ask for. If an extra step seems worth it, suggest it to the user instead.

A child session may refuse a relayed approval for a step that is hard to undo, such as a merge. So an approval given here is acted on here, and an approval the child needs is given by the user in that session.

When a short reply from the user could apply to more than one session, say which one you assumed.
