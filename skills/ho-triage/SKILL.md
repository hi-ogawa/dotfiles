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

The deliverable is a `triage-<slug>/` folder — a `TRIAGE.md` holding the diagnosis (root cause, verdict, fix direction) plus any minimal repro files beside it. Details in Output below.

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
- Use cheap read-only tools, file read, file search, `git` and `gh` for change history. Check comments and recent changes near the suspect code.
- Do **not** run code, start servers, install packages, build, or edit files by default — and never create repro scaffolding inside the inspected repo (it goes in the triage dir).

Default to *not* running. Constructing the educated-guess repro is the deliverable; verifying it by running is opt-in — only when the user asks, an existing repro is trivial to run, or one quick run would settle what reading cannot. If it gets messy, bail after about two failed attempts and continue with the diagnosis from reading.

## Distill a minimal repro

The first move is an *educated-guess* repro built from the report plus the code you've read — **not** a verified one. Reduce the report to the smallest case that should still trigger the bug: the essential config, code, inputs, and steps, with incidental noise from the larger app removed. Reason about which ingredients are load-bearing. Do not run anything to confirm at this stage.

Place these files **directly in `triage-<slug>/` as siblings of `TRIAGE.md`** — the triage dir itself *is* the reproduction (e.g. `triage-<slug>/package.json`, **never** `triage-<slug>/repro/package.json` for js projects). Do **not** create a dedicated repro subdirectory such as `triage-<slug>/repro/`, and never scaffold inside the repo being inspected. Document the install/run commands in `TRIAGE.md`. For JavaScript/TypeScript projects, prefer `pnpm` over `npm`, `yarn`, etc., unless the report hinges on a specific package manager.

Producing these files is still skim-first. Actually running them to verify is a separate, opt-in step (see default mode).

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

Unless instructed otherwise, the deliverable is a triage folder following the `ho-dev-notes` skill convention. Always read the `ho-dev-notes` skill first to determine the notes base and project folder. Create `triage-<slug>/` holding `TRIAGE.md` and any repro artifacts directly beside it (flat, not in a subfolder).

Then post a short summary in chat, starting with both paths on separate lines:

```text
Triage folder: /path/to/triage-<slug>
Triage note: /path/to/triage-<slug>/TRIAGE.md
```

Keep the rest brief: root cause, fix direction, and the likely follow-up directions for review to pursue.

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
The smallest case that should trigger the bug. Include the saved repro artifact paths and the install/run command when executable.

## Verdict
bug / intended-behavior / unclear, with the evidence (comment, blame, prior issue).

## Fix direction
Where and roughly how to fix. Not a patch.

## Follow-up directions
The concrete next probes for review to pursue — typically: confirm the repro actually triggers the bug, confirm it's minimal (which ingredients are load-bearing), and probe upstream dependencies when the cause may originate there. Add any genuinely open, case-specific uncertainty and what would settle it. Don't restate that the repro is unrun/unconfirmed — an unverified educated-guess repro is the expected state of a first pass.
```
