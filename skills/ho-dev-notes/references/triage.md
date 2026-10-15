# Triage Mode

Work backward from a symptom to its root cause in existing code, and stop at a proposed fix direction. Applying or verifying a fix is a separate step the user asks for.

## Gather

Start from an issue (`gh issue view <n> --json number,url,title,body,comments,state,labels`), a local repro, or a description in the conversation. If it names no symptom, error, or expected behavior, say what is missing and ask.

Diagnose by reading, because reading the report and the relevant code usually finds the cause and never gets stuck the way running things can. Follow error messages and stack traces into call sites and data flow, and check comments and `git log` or `git blame` near the suspect code. Do not run code, build, install, or edit the inspected repo. Run something only when the user asks or one quick run would settle what reading cannot, and give up after about two failed attempts.

## Repro

Distill the report into the smallest case that should still trigger the bug, keeping only the load-bearing config, code, inputs, and steps. This is an educated guess from reading, and it stays unrun by default. Put its files directly in the topic directory beside `TRIAGE.md`, never in a `repro/` subdirectory or inside the inspected repo, and document the install and run commands. For JavaScript projects, use `pnpm` unless the report depends on another package manager.

## Bug or Intended

Before calling something a bug, check whether the author knew about and chose the behavior. A comment explaining it, a conditional that handles exactly this case, a commit or PR stating the rationale, or a prior issue closed as by design all point to intended behavior, which makes the report an enhancement request. Say so when the evidence is ambiguous.

## Report

Write `TRIAGE.md` in a `triage-<slug>/` topic directory, omitting empty sections:

- **Summary**: what is wrong and where, in a line or two.
- **Root cause**: the logic at fault and why it produces the symptom, with a source link to the smallest relevant location.
- **Minimal repro**: the case, its file paths, and how to run it.
- **Verdict**: bug, intended, or unclear, with the evidence.
- **Fix direction**: where and roughly how to fix, not a patch.
- **Follow-up directions**: the next probes, such as confirming the repro triggers the bug, finding which ingredients are load-bearing, or checking whether the cause originates upstream.

When confidence is low, name the likely code paths and why, the competing theories and what would settle them, and the cheapest next probe, instead of a confident root cause.

When the failure path spans more than a few steps, draw it as a companion figure following `ho-artifacts`.

Reply in chat with the folder and note paths on separate lines, then the root cause, fix direction, and follow-up directions in brief.
