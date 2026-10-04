---
name: ho-pr
description: >-
  Create a draft pull request with a description in the user's style. Use whenever creating a pull request or writing a PR description.
---

# Pull Request

Create the PR as a draft.

- Put related links first as bullets, e.g. `- closes <url>`, `- follow-up to <url>`.
- Then write a few short paragraphs of prose covering both why (what was broken, or the motivation) and what this PR does. A bullet list is fine when the prose introduces what it lists, but not as a stand-in for the explanation.
- Accompany the prose with a minimal snippet, table, or diagram when it shows the change more effectively.
- Leave out routine validation, such as lint, tests, or CI passing, which the checks already show and which says nothing about the change.
- Describe behavior a user or reviewer sees, not internals such as function names, file paths, or types, because the diff already shows them and review keeps changing them. A description written this way only needs an update when a change alters the behavior, scope, or motivation, not after every commit.
- Title follows the repo's commit convention.

## Editing

A PR description has other writers, such as the user, CI, and other sessions, so treat an edit as a read-modify-write. Read the live body right before writing, rewrite only the stale prose, and keep the rest as it is.
