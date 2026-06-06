# Inspired By

This skill was loosely inspired by the bug-triage skill in the **astro** repo:

- Local clone: `~/code/others/astro/.agents/skills/triage/`
- Upstream: `withastro/astro`, path `.agents/skills/triage/`

That skill is an orchestrated, sandboxed, **automated** pipeline (reproduce → diagnose → verify → fix → comment) run by staged subagents that hand off through a shared `report.md`. `ho-triage` is the opposite shape on purpose: **interactive, single-agent, skim-first, read-only**, ending at diagnosis + fix direction. So we take ideas, not structure.

## Bits already borrowed

- **Bail-fast / time-boxed reproduction.** Astro's `SKILL.md` "General Rules" and `reproduce.md` "Server Management Rules" (bail after 2 failed server starts, don't loop, "server problems must not consume your time budget") → our *Run a reproduction* section. This is the strongest lesson: repro is the trap.
- **Bug vs. intended-behavior test.** `verify.md`'s "did the developer *know about and choose* this behavior?" framing, checked via comments / explicit conditionals / git blame / prior issues → our *Bug vs. intended behavior* section.
- **Low-confidence breadcrumbs.** `fix.md`'s low-confidence path (don't force a fix; point at likely files, drop `// TRIAGE:` signposts, optionally a failing test) → our *When confidence is low* section.
- **Tone calibration.** `diagnose.md`'s "a missing null check is a missing null check, not a critical oversight" → our *Output* section.

## Deliberately NOT taken

The automation scaffolding, since `ho-triage` is interactive: `report.md` handoff, subagent staging, sandbox early-exit taxonomy, instrumentation-based diagnosis (console.log + rebuild + rerun), and the changeset / unit-test / GitHub-comment generation steps.

## Worth stealing later

If `ho-triage` ever grows, these are the parts still on the table:

- **Richer intent evidence** (`verify.md` §2): explicit docs check, `git show` on the blamed commit/PR, and `gh search issues` / `gh search prs` for prior discussion. We have a condensed version; could expand the *Bug vs. intended behavior* section.
- **Don't-break-the-user fix rule** (`diagnose.md` / `fix.md`): "never suggest removing a user's dependency (adapter, integration, feature) as a fix." Good guardrail for *Fix direction* if fix suggestions get more concrete.
- **Reproduction early-exit taxonomy** (`reproduce.md`): host-specific / unsupported-version / runtime-specific skip conditions — useful only if we ever lean harder into running repros.
- **GitHub comment template + priority calibration** (`comment.md`): an at-a-glance status block and "err lower on priority" guidance — relevant only if `ho-triage` ever emits a postable issue comment.
