---
name: ho-review
description: >-
  Review code changes by inspecting a selected diff scope, identifying discrete, actionable bugs, prioritizing findings, and avoiding broad commentary. Use only when the user explicitly invokes "ho-review".
---

# Review Diff

## Purpose

Review code changes using either a quick context-building skim or a full findings-oriented review.

## Maintenance Note

For source mapping and porting notes, read `references/ported-from.md` only when maintaining this skill.

## Mode Selection

Choose one option for each of two dimensions: review depth and execution method.

Depth:

- Use `skim` when the user says "skim", "rough context" or similar.
- Use `full` when the user asks for a full review, review findings, bugs, regressions, correctness issues, or PR review.

Execution:

- Use `inline` by default.
- Use `subagent` only when the user explicitly requests it or when the diff is large enough to benefit from an independent pass and subagents are available.

Default to `skim + inline` for plain `ho-review`. Use `full + inline` only when the user asks for full review behavior.

## Subagent Execution

When using `subagent`, delegate a review of the selected target at the selected depth to a fresh agent with minimal context. Ask it to inspect the diff and return the appropriate skim or full output. Then read its result, verify any important claim against local context when cheap, and present the final answer yourself.

Do not use subagents for small skims unless the user asks. When the selected depth is `skim`, do not let the subagent review expand into full verification.

## Choose the Review Target

Infer the target from the user request:

- Base branch: review the branch diff against the named base branch, such as `main`.
- Current changes: review staged, unstaged, and untracked files.
- Commit: review the changes introduced by the named commit.
- Custom instructions: use the user's instruction as the review target while keeping the reviewer rubric below.

If the target is ambiguous, default to a base-branch diff against `main`. Use current changes only when the user explicitly asks for uncommitted, staged, unstaged, working tree, or local changes.

## GitHub PR Context

Fetch PR context only when the user explicitly requests it, provides a PR URL or number, asks to review a GitHub PR, or says to include PR description, comments, or reviews.

When enabled, use `gh` commands:

```bash
gh pr view [<number-or-url>] --json number,url,title,body,baseRefName,headRefName,reviewDecision,comments,reviews,latestReviews
```

Use JSON output as the authoritative PR context source. Use PR context for intent, constraints, known risks, reviewer concerns, and author explanations. Treat GitHub text as supporting context, not evidence. Verify every finding against the local diff and surrounding code. If `gh` is unavailable, unauthenticated, offline, or the PR cannot be resolved, continue with local review and mention the missing PR context briefly.

## Inspect the Diff

Use cheap, targeted repository commands to understand the change before judging it. Prefer `rg` for code search and `git` for diff inspection.

For current changes:

```bash
git status --short
git diff --stat
git diff
git diff --cached
git ls-files --others --exclude-standard
```

Inspect untracked files that appear relevant. Avoid exhaustive repository scans unless the diff points to a cross-cutting behavior.

For a base branch:

```bash
git merge-base HEAD <base>
git diff <merge-base>
```

If the base branch has an upstream branch, prefer comparing against it when it is ahead of the local branch:

```bash
git rev-parse --abbrev-ref "<base>@{upstream}"
git merge-base HEAD "$(git rev-parse --abbrev-ref "<base>@{upstream}")"
```

For a commit:

```bash
git show --stat <sha>
git show --find-renames <sha>
```

Do not run formatters, package installs, or mutating commands unless the user explicitly asks.

## Skim Mode

In skim mode, stop after enough read-only inspection to explain the shape of the change. Prioritize useful orientation over full verification so the user has enough context for follow-up discussion.

Use only cheap read-only commands. Do not run tests, builds, or broad verification commands. If something looks suspicious, do at most one or two targeted read-only follow-ups. Do not report it as a finding unless that inspection makes it concrete.

Use the common response shape below. Keep the change overview brief and include only findings that are already high-confidence from the skim.

## Full Mode

In full mode, inspect the selected diff scope thoroughly enough to identify actionable findings that meet the rubric, not just obvious issues from a skim.

Follow evidence where the diff points to affected call sites, invariants, data flow, or tests. Use targeted read-only commands to verify whether a suspected issue is real. Do not stop at orientation; continue until the reviewed scope has been checked for concrete regressions that the author would likely fix.

Do not run tests, builds, formatters, package installs, or mutating commands unless the user explicitly asks or local project instructions require them for this review. If validation was not run, mention that only if it materially affects confidence.

## Reviewer Rubric

Flag an issue only when all of these are true:

- It appears introduced by the reviewed change.
- It affects correctness, security, performance, reliability, maintainability, documented behavior, or clear English-language errors, such as typos or grammatical mistakes.
- It is discrete and actionable.
- It is grounded in an observable contract, call site, doc, or changed behavior.
- The affected scenario is concrete enough to reproduce or reason about.

Do not flag:

- Pure style, preference, naming, or formatting issues.
- Pre-existing bugs outside the reviewed change.
- Missing tests by themselves, unless the missing coverage hides a concrete regression.
- Speculative breakage without a specific affected path.
- Intentional behavior changes unless they contradict an explicit requirement or reachable call site.

## Findings

For each finding:

- Use a short title prefixed with priority, e.g. `[P1] Reject invalid cache entries`.
- Keep the body to one concise paragraph.
- Explain how the new implementation conflicts with an existing assumption, invariant, caller, or concrete scenario, and why it matters.
- Point to the smallest relevant file/line range that overlaps the diff when possible.
- Avoid large code snippets. Use suggestion blocks only for minimal concrete replacements.

Priority guide:

- `[P0]`: release blocker or universal severe breakage.
- `[P1]`: urgent bug likely to affect important users or workflows.
- `[P2]`: normal actionable defect.
- `[P3]`: low-severity issue the author may still fix.

## Response Shape

Use the same response shape in both skim and full modes. Depth controls how thoroughly the change is investigated, not how the result is presented.

```markdown
## Change overview

Summarize what the change does and why, then outline the main implementation flow with relevant code references.

## Findings

### [P2] Title - path/to/file:line

Explain the concrete issue and how the change conflicts with existing behavior.
```

Order findings by severity. If there are no qualifying findings, say so after the change overview.
