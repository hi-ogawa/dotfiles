---
name: ho-triage
description: >-
  Diagnose a bug from a thin starting point (issue link, local repro, or a sentence of context) by skim-reading the codebase, and deliver a root-cause diagnosis with a proposed fix direction. Read-only and skim-first by default. Use only when the user explicitly invokes "ho-triage".
---

# Triage

## Maintenance Note

For inspiration sources and bits worth stealing later, read `references/inspired-by.md` only when maintaining this skill.

## Purpose

Turn a thin starting point into a root-cause diagnosis. This consolidates a manual step: given an issue, a repro, or a vague description, figure out *what is actually wrong and where*, and point at how to fix it — without going further.

The agent is usually already inside the relevant repo. Lean on that: the answer is almost always reachable by reading the codebase, not by running it.

This is the inverse of a diff review. A review starts from a change and looks for bugs it introduced; triage starts from a symptom and works backward to the cause in existing code.

## Scope

In scope:

- Understand the reported problem.
- Locate the relevant code and identify the root cause.
- Distill a concrete minimal repro from the report.
- Distinguish a real bug from intended behavior.
- Propose a fix direction (where and roughly how), or leave breadcrumbs when confidence is low.

Out of scope by default (hand off afterward):

- **Applying the fix.** Stop at the proposed direction.
- **Verifying a fix.** No editing, building, or test-running to confirm.
- **Running a reproduction.** See below — opt-in and time-boxed, not the default path. (Distilling a minimal repro on paper *is* in scope.)

Only cross these lines if the user explicitly asks.

## Input

Accept any one of:

- **Issue link or number** — fetch with `gh issue view <n> --comments` for the description, expected vs actual, and clarifying comments.
- **Local repro** — a pointer to a failing case already set up (a directory, a test, a command). Read it; don't assume it must be run.
- **A sentence of context** — an informal description or stack trace in the conversation.

If the starting point is too thin to locate anything (no symptom, no error, no expected behavior), say what's missing and ask rather than guessing.

## Default mode: skim-first, read-only

Diagnose by reading. In most cases, reading the context plus the relevant code is enough to find the cause — and it never gets stuck the way running things can.

- Follow the evidence: error messages and stack traces point at files; from there read call sites, data flow, and the surrounding logic.
- Use cheap read-only tools — `rg` for search, `git log`/`git blame`/`git show` for history, file reads. Check comments and recent changes near the suspect code.
- Do **not** run code, start servers, install packages, build, or edit files.

## Distill a minimal repro

Part of triage is reducing the report to the smallest case that should still trigger the bug — the essential config, code, inputs, and steps, with everything incidental stripped. Raw issues are usually convoluted (a whole app, unrelated dependencies, narrative noise), and the minimal case is what a maintainer actually needs.

This is a diagnostic tool, not just a deliverable: if you can't state the minimal trigger, you don't yet understand which conditions are load-bearing. Distilling it forces that clarity and often exposes the cause.

It's a written artifact, consistent with skim-first — you're *specifying* the repro, not running it. Base it on the reported case and the code path you traced. Keep it concrete (actual snippets, config, commands — not "set up a project with X"), and mark any step you're inferring rather than confirming.

When the repro is executable, prefer saving it as ready-to-run files in the triage folder beside `TRIAGE.md` rather than only inlining it. Put the project's files (manifest, sources, config, fixtures) directly beside `TRIAGE.md` unless a subdirectory is needed for clarity. Keep it copy-out-able: only what's needed to trigger the bug, no installed dependencies or lockfiles, since the folder isn't wired into the repo's workspace and must stand alone. Put the run command (install + the single triggering command) in `TRIAGE.md`. Inline only trivial snippets where separate files would not make the repro easier to run. Writing these files is still skim-first — producing them is not running them; whether to actually run follows the opt-in rules below.

## Run a reproduction: opt-in and time-boxed

Actually running a reproduction is deliberately de-emphasized. Edge-case repro tends to get messy — flaky servers, missing tooling, environment drift — and traps the agent in a loop. Skim-first avoids that entirely.

Attempt repro only when one of these holds:

- The user explicitly asks for it.
- A working repro is already provided and running it is trivial.
- Skimming genuinely can't resolve the cause and a quick run would decide it.

When you do run something, **time-box it: bail after about two failed attempts** and continue with what you learned. Don't loop on server restarts, port conflicts, or install errors. A diagnosis from reading plus a note that repro wasn't confirmed beats no diagnosis because you fought the tooling.

## Bug vs. intended behavior

Before calling something a bug, check whether the behavior was deliberate. The question is not "is this behavior good?" but "did the author *know about and choose* it?"

Strong signals it's intended (a known limitation or trade-off, i.e. an enhancement request, not a defect):

- A comment explains the behavior or limitation ("we skip this in SSR because…").
- An explicit conditional handles exactly this case by design.
- `git blame` leads to a commit or PR whose message states the rationale.
- A prior issue was closed as "by design."

Signals it's a real bug: no rationale anywhere, contradicts documented behavior, a clear regression, or an unhandled edge that falls through by accident. When the evidence is genuinely ambiguous, say so rather than forcing a verdict.

## When confidence is low

Don't manufacture a confident root cause. Leaving good breadcrumbs is more useful than a wrong diagnosis:

- Name the most likely files / functions / code paths and why each seems relevant.
- State the competing theories and what evidence would settle them.
- Suggest the cheapest next probe (a specific line to log, a specific test to write).

## Output

Unless instructed otherwise, the deliverable is a triage folder following the `ho-dev-notes` skill convention. Always read the `ho-dev-notes` skill first to determine the desired `.dev-notes` base location, such as `.dev-notes/dist` versus `.dev-notes`.

Create `<base>/triage-<slug>/` holding `TRIAGE.md` and any repro artifacts beside it. Then post a short summary in chat.

`TRIAGE.md` shape (omit empty sections):

```markdown
# Triage: <short title>

## References
issue link, etc.

## Summary
One or two lines: what's wrong and where.

## Root cause
The specific logic at fault and why it produces the observed behavior.
Point to the smallest relevant location with a clickable link.

## Minimal repro
The smallest case that should trigger the bug — concrete config/code/steps, incidentals stripped. Inline it, or point to repro artifacts saved in this folder. Mark inferred steps.

## Verdict
bug / intended-behavior / unclear, with the evidence (comment, blame, prior issue).

## Fix direction
Where and roughly how to fix. Not a patch.

## Open questions
Anything unconfirmed, and what would confirm it (note if repro wasn't run).
```
