---
name: ho-pr
description: >-
  Create a draft pull request with a first-draft description in the user's style. Use only when the user explicitly invokes "ho-pr".
---

# Pull Request

Create the PR as a draft (`gh pr create --draft`). The description is also a first draft that the user will iterate on.

- Put related links first as bullets, e.g. `- closes <url>`, `- follow-up to <url>`.
- Then write a few short paragraphs of prose, not summary bullets, covering both why (what was broken, or the motivation) and what this PR does.
- No sections such as `## Summary` or `## Testing`.
- Title follows the repo's commit convention.
