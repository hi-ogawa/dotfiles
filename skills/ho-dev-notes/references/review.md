# Review Mode

Build the context a reviewer needs before judging a change. Bug hunting belongs to a dedicated review command, so mention a concrete bug only if it surfaces along the way.

## Gather

For a PR, read its description, linked issues, and review discussion with `gh`, then the diff. For a branch or commit, read the diff against its base. Read enough surrounding code to see what the changed code plugs into, such as its callers and the state it touches. Use read-only commands only, and do not run tests or builds.

## Report

Write `REVIEW.md` in a `review-<slug>/` topic directory covering:

- **Why**: the problem or motivation, from the PR and linked issues.
- **What changes**: behavior a user or caller sees, before and after.
- **Shape**: the main flow through the change from its entry point, with source links, separating the core change from mechanical edits.
- **Where to look**: the parts that deserve a careful read, open questions, and unresolved review threads.

When the shape spans more than a few steps, draw it as a companion figure following `ho-artifacts`.

Reply in chat with the note path and a short summary of why, what changes, and where to look.
