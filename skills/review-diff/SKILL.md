---
name: review-diff
description: "Review code changes by inspecting a selected diff scope, identifying discrete actionable bugs, prioritizing findings, and avoiding broad commentary. Use only when the user explicitly invokes $review-diff."
---

# Review Diff

## Purpose

Review code changes as an explicitly invoked skill. Support both quick context-building skims and full review-finding passes.

## Maintenance Note

For source mapping and porting notes, read `references/ported-from.md` only when maintaining this skill.

## Mode Selection

Select two modes: depth and execution.

Depth:

- Use `skim` when the user says "skim", "rough context" or similar.
- Use `full` when the user asks for a full review, review findings, bugs, regressions, correctness issues, or PR review.

Execution:

- Use `inline` by default.
- Use `subagent` only when the user explicitly asks for it, or when the diff is large enough that an independent pass is useful and subagents are available.

Default to `skim + inline` for plain `$review-diff`. Use `full + inline` only when the user asks for full review behavior.

## Subagent Execution

When using `subagent`, delegate the selected depth and target to a fresh agent with minimal context. Ask it to inspect the diff and return the appropriate skim or full output. Then read its result, verify any important claim against local context when cheap, and present the final answer yourself.

Do not use subagents for small skims unless the user asks. Do not let subagent use turn into full verification when the selected depth is `skim`.

## Choose The Review Target

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
gh pr view [<number-or-url>] --comments
```

Use PR context for intent, constraints, known risks, reviewer concerns, and author explanations. Treat GitHub text as side context, not evidence. Verify every finding against the local diff and surrounding code. If `gh` is unavailable, unauthenticated, offline, or the PR cannot be resolved, continue with local review and mention the missing PR context briefly.

## Inspect The Diff

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

If the base has an upstream and resolving it is useful, prefer the upstream comparison when it is ahead of the local branch:

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

In skim mode, stop after enough read-only inspection to explain the shape of the change. Prefer useful orientation over full verification to build initial context to continue with interactive follow-up discussions.

Use only cheap read-only commands. Do not run tests, builds, or broad verification commands. If something looks suspicious, do at most one or two targeted read-only follow-ups; otherwise list it as a follow-up rather than proving it.

Do not force issues into formal findings. Promote something to a finding only when it is already concrete from the skim.

Return:

- What changed.
- Inferred intent and current status.
- Obvious issues to call out, only if high-confidence from the skim.
- Suggestions and directions to continue reviews and discussions.

## Full Mode

In full mode, inspect the selected diff scope thoroughly enough to identify all qualifying actionable findings, not just obvious issues from a skim.

Follow evidence where the diff points to affected call sites, invariants, data flow, or tests. Use targeted read-only commands to verify whether a suspected issue is real. Do not stop at orientation; continue until the reviewed scope has been checked for concrete regressions that the author would likely fix.

Do not run tests, builds, formatters, package installs, or mutating commands unless the user explicitly asks or local project instructions require them for this review. If validation was not run, mention that only if it materially affects confidence.

## Reviewer Rubric

Flag an issue only when all of these are true:

- It meaningfully affects correctness, security, performance, reliability, maintainability, or documented behavior.
- It is discrete and actionable.
- It appears introduced by the reviewed change.
- It does not rely on hidden assumptions about author intent.
- The affected scenario is concrete enough that the author can reproduce or reason about it.
- The patch author would likely fix it if told.

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
- Explain the exact scenario where the bug appears and why it matters.
- Point to the smallest relevant file/line range that overlaps the diff when possible.
- Avoid large code snippets. Use suggestion blocks only for minimal concrete replacements.

Priority guide:

- `[P0]`: release blocker or universal severe breakage.
- `[P1]`: urgent bug likely to affect important users or workflows.
- `[P2]`: normal actionable defect.
- `[P3]`: low-severity issue the author may still fix.

## Response Shape

In skim mode, use this shape by default:

```markdown
What changed
- Brief bullets describing the shape of the diff.

Inferred intent
- Why the change appears to exist, if reasonably inferable.

Risk areas
- Concrete areas worth attention.

Obvious issues
- Only high-confidence issues visible from the skim.

Suggested next checks
- Checks not run.
```

Omit empty sections. Keep skim output concise and context-oriented.

In full mode, lead with findings, ordered by severity. If there are no qualifying findings, say that clearly.

Use this shape by default:

```markdown
Findings
- [P2] Title - path/to/file:line
  One-paragraph explanation of the concrete issue.

Open questions or assumptions
- ...

Summary
- Brief note on what was reviewed and any meaningful test gap.
```

Omit empty sections. Keep the final answer concise and review-focused.

If the user explicitly asks for machine-readable output, return this JSON shape with no markdown fence:

```json
{
  "findings": [
    {
      "title": "[P2] <short title>",
      "body": "<one paragraph>",
      "confidence_score": 0.0,
      "priority": 2,
      "code_location": {
        "absolute_file_path": "/abs/path",
        "line_range": {"start": 1, "end": 1}
      }
    }
  ],
  "overall_correctness": "patch is correct",
  "overall_explanation": "<1-3 sentences>",
  "overall_confidence_score": 0.0
}
```
