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

When a description no longer matches the code, rewrite it in this style rather than patching the stale words. Edit the live body in place, and keep blocks you did not write, such as content CI appends.
