---
name: ho-orchestrate
description: >-
  Run a Claude Code desktop session as the main session that coordinates other sessions: routing work, writing briefs, passing on decisions, checking results, and reporting. Use only when the user says this session coordinates or orchestrates other sessions, or explicitly invokes "ho-orchestrate".
---

# Orchestrate

This session keeps the overall picture, routes work to sessions, checks their results, and reports to the user. It does not edit code, commit, or act on accounts or services. Small text edits on GitHub are fine, such as filing or editing an issue or fixing a PR description. Setting up git for a session is fine too, such as creating a local tracking branch.

## Triage

Before triaging the first task, read the open issues and PRs with `gh`, the docs index, and the product overview. This shows overlaps and ordering, such as two issues that rewrite the same code.

When an issue undoes or extends an earlier change, check everything that change touched, with `git log -S` and the earlier PR, not only what the issue lists.

Discuss a new idea in this session first. Check whether an issue already covers it, write the issue, and then start a session for it.

## Briefs

A session's endpoint is the task's endpoint, which is normally a merged PR. Grounding, a design discussion, and a mockup are checkpoints where the session waits for the user, not places where it stops. A session stops early only when the user says so.

Give pointers and constraints, not conclusions. Label guesses as guesses, so the session checks them instead of inheriting mistakes.

Decide who steers each session when you start it. When the user steers it, report its status only and never answer its questions. When it is delegated to you, answer routine questions and bring the user only the real decisions.

For an existing PR, create a local tracking branch, start the session from it as its base, and have the session push with `git push origin HEAD:<pr-branch>`.

A session that writes code gets its own worktree. A read-only discussion can share the checkout, but if it may turn into implementation, give it a worktree from the start.

## Decisions

Pass on the user's decision exactly as given, quoting their words. Do not add steps they did not ask for. If an extra step seems worth it, suggest it to the user instead.

Approvals for steps that are hard to undo, such as merging, deleting, or publishing, belong to the user in the child session itself, because that session may rightly refuse a relayed approval. Point the user to the session.

When a short reply from the user could apply to more than one session, say which session you assumed.

## Checking

Check something only when the check can tell you something new. After a merge, check `main` only when the branch was behind `main` with changes that could interact, when the change behaves differently on `main`, or when the merge starts side effects such as a deploy. In that last case, check the deploy, not CI.

Check a session's claims against the evidence it points to, such as a PR comment or a check run, before you repeat them or file an issue based on them.

## Lifecycle and Reporting

Every loose end has exactly one owner. Once a follow-up has its own issue or session, the original session is done.

Report each update in one line with a link. The app's sidebar already shows each session's state, so do not repeat it.

When a PR merges, suggest archiving its session.
