---
name: ho-pr
description: >-
  Create a draft pull request with a description in the user's style. Use whenever creating a pull request or writing a PR description.
---

# Pull Request

Create the PR as a draft.

- Put related links first as bullets, e.g. `- closes <url>`, `- follow-up to <url>`.
- Then write a few short paragraphs of prose, not summary bullets, covering both why (what was broken, or the motivation) and what this PR does.
- Accompany the prose with a minimal snippet, table, or diagram when it shows the change more effectively.
- No sections such as `## Summary` or `## Testing`.
- Describe behavior a user or reviewer sees, not internals such as function names, file paths, or types, because the diff already shows them and review keeps changing them.
- No testing, validation, or coverage lists, and no notes addressed to the user.
- Describe what the PR does, not a settled future direction it implies.
- Title follows the repo's commit convention.

## Editing

A PR description has other writers, such as the user in the browser, CI, and other sessions, so treat an edit as a read-modify-write:

- Update the description only when a change alters what it says, such as the behavior, scope, or motivation, not after every commit.
- Read the live body right before writing, never a copy from earlier in the session.
- Rewrite the stale prose in this style rather than patching words, and keep the rest of the body as it is.
