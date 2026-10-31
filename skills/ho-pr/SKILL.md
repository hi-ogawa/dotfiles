---
name: ho-pr
description: >-
  Create a draft pull request with a description in the user's style. Use whenever creating a pull request or writing a PR description.
---

# Pull Request

Create the PR as a draft.

- Put related links first as bullets, e.g. `- closes <url>`, `- follow-up to <url>`, `- part of <url>`, `- stacked on <url>`, `- review artifact <url>`.
- Put a `WIP 🤖` line right after the link bullets, which marks the PR as agent-written and not yet reviewed by the user. Keep it on every later edit, and leave removing it to the user.
- Title follows the repo's commit convention.
- GitHub's stacked PRs only support a linear stack, and it refuses to retarget a PR inside one. When a PR depends on another in a way that would not form a linear stack, base it on `main`, link the dependency as `- depends on <url>`, and tell the user.

## Description

The goal is a description a reviewer can skim for the most information per line. The points below are defaults that usually serve it, so judge each against the PR at hand and drop or bend any that would only add length.

- Write the why and the what as separate short paragraphs, first what was broken or the motivation, then what this PR does, so a reader can find the change by skimming. For example, `Previously, <old behavior and why it is a problem>.` followed by `This PR <what it changes and what that does>.`
- Show the change with a minimal snippet, table, list, or diagram when it says more than prose would.
- Leave out routine validation, such as lint, tests, or CI passing, which the checks already show and which says nothing about the change.
- Prefer behavior a user or reviewer sees over internals such as function names, file paths, or types, because the diff already shows them, and they change with every round of review, so the description would keep going stale. Time updates following the Revision section in `ho-writing`.

## Reading and Editing

A PR has other writers, such as the user, CI, and other sessions, so what you wrote or saw earlier may no longer be true. Fetch the PR right before you edit its description or say anything about its current state, such as what the description contains, whether checks pass, or whether it is merged. This includes a passing remark in a summary. When you edit the description, rewrite only the stale prose and keep the rest as it is. Mention the description to the user only when you edited it, not to report that it still matches.
