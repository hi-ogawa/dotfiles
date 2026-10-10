---
name: ho-structure-review
description: >-
  Review a code change for the structure and surface problems that human review keeps catching in agent-written code, reading the diff as a newcomer. Use only when the user explicitly invokes "ho-structure-review".
---

# Structure Review

## Purpose

Catch the structure and surface problems that human review keeps pointing at, before the human has to.

## Maintenance Note

For the research behind this skill, read `references/research.md` only when maintaining this skill.

## Target

Review the current branch against its base, together with uncommitted and untracked changes, unless the user names another target.

Before answering, read the nearest existing code for each changed unit, such as siblings in the same module and the code the change follows or replaces, and the repository's and the user's agent instructions, such as AGENTS.md and the user-level CLAUDE.md.

## Questions

Use the diff to find what changed, then read each changed file as it reads after the change, whole and in order, the way a human meets it, rather than retrieving lines by search. A chunk is what a reader holds at once, such as a function, a section, or a hunk with its surrounding code. Answer every question that applies with findings anchored to lines, and say briefly when one doesn't apply.

1. Reuse: does the repository already have a helper, module, or pattern for anything the diff writes by hand? Search before answering.
2. Machinery: does every guard, fallback, default, option, copy, wrapper, type, and module serve a case that actually occurs?
3. Chunks: can each chunk be understood and validated with one kind of expertise, without repeatedly loading another chunk's rules, and are generic mechanics kept apart from domain logic?
4. State: is any concept held in more than one place, such as a derived value stored beside its source, parallel fields or maps, or a mode flag that keeps an old split alive?
5. Interface: does every implemented method do something, and does each unit take only what it uses, in the shape its callers need?
6. Ownership: is each guard, dedupe, and decision made by the owner of the state it concerns?
7. Naming: is there one name per concept, named for its role at the call site rather than its mechanism?
8. Comments: does any comment restate the code or a name, justify defensively, or describe what the code used to do or isn't?
9. Tests: do the tests follow the repository's existing test style and layers?
10. Churn: does the diff change anything its purpose didn't need, such as renames, moves, reformatting, or edits to shared code, or interleave such edits with the real change?
11. Reading order: does each file read top-down, with entry points and callers before the helpers they use, so a reader never needs code they haven't reached yet?

## Report

Report the findings as a list, each with its location, the problem, and a concrete fix. Edit only when the user asks for fixes.
