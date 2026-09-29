# Explain Diff Artifacts

Material for iterating on a page that explains a code change, diff, branch, commit series, or PR, once a first draft exists.

## Read first

Inspect the complete diff and enough surrounding code to explain behavior accurately. Read linked issues and design notes for context, but do not repeat what the reader already has open, and do not treat earlier explorations as a specification.

## Fit the reader

The same change calls for different pages depending on who reads it.

- **A reviewer or future reader following a PR link** already has the diff. Give them what the diff does not show: the concept, what changes in behavior and what does not, the few code spots that carry the change, and what the change leaves for later.
- **Someone onboarding to an unfamiliar change** needs more background, a toy example, and a walkthrough in causal order. A few questions with immediate feedback can help here.

In both cases, lead with one concrete scenario traced before and after the change, and order explanations so causes come before the effects that depend on them.
