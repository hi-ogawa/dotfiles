---
name: ho-pr
description: >-
  Create a draft pull request with a description in the user's style. Use whenever creating a pull request or writing a PR description.
---

# Pull Request

Create the PR as a draft.

- Put related links first as bullets, e.g. `- closes <url>`, `- follow-up to <url>`, `- part of <url>`, `- stacked on <url>`, `- review artifact <url>`.
- Put a `WIP 🤖` line right after the link bullets, which marks the PR as agent-written and not yet reviewed by the user. Keep it on every later edit, and leave removing it to the user.
- Then write the why and the what as separate short paragraphs, first what was broken or the motivation, then what this PR does, so a reader can find the change by skimming. A bullet list is fine when the prose introduces what it lists, but not as a stand-in for the explanation.
- Accompany the prose with a minimal snippet, table, or diagram when it shows the change more effectively. Introduce each one with a sentence that says what it shows.
- Leave out routine validation, such as lint, tests, or CI passing, which the checks already show and which says nothing about the change.
- Describe behavior a user or reviewer sees, not internals such as function names, file paths, or types, because the diff already shows them and review keeps changing them. That keeps the description stable while the PR iterates. Time updates following the iteration rule in `ho-writing`.
- Title follows the repo's commit convention.
- GitHub's stacked PRs only support a linear stack, and it refuses to retarget a PR inside one. When a PR depends on another in a way that would not form a linear stack, base it on `main`, link the dependency as `- depends on <url>`, and tell the user.

## Editing

A PR description has other writers, such as the user, CI, and other sessions, so treat an edit as a read-modify-write. Read the live body right before writing, rewrite only the stale prose, and keep the rest as it is.
