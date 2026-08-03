---
name: ho-pr
description: >-
  Write a pull request description in the user's concise, narrative-first style. Use only when the user explicitly invokes "ho-pr".
---

# Pull Request Description

## Purpose

Write a PR description that explains the motivation and concrete change in proportion to the PR. Prefer natural prose over a fixed template.

## Style

- Default to one to three short prose paragraphs with no headings.
- Explain why the change is needed, then what the PR does.
- Use `This PR ...` naturally when introducing the concrete change.
- Put issue or follow-up links first as lightweight bullets when they provide context, for example `- closes <url>`, `- follow-up to <url>`, or `- related to <url>`.
- Do not add a summary bullet list merely to enumerate changed files or commits.
- Do not add a testing section by default. Mention verification only when it is central to understanding the change or the user asks for it.
- Omit a body entirely for a truly self-explanatory PR when no context would help reviewers.
- For larger technical changes, add only the structure needed to explain them. Examples, code blocks, or a `TODO` checklist are appropriate when they materially aid review.
- Describe the resulting behavior and rationale rather than narrating commit history.
- Preserve the author's direct, informal technical voice. Do not polish it into generic corporate prose.
- Avoid boilerplate such as `## Summary`, `## Testing`, exhaustive file lists, and implementation trivia.

## Scale to the Change

Small fix:

```markdown
- closes <issue-url>

This PR fixes <specific behavior> by <concrete change>.
```

Contextual change:

```markdown
<Problem or motivation, including the practical consequence.>

This PR <concrete change and why it addresses the problem>.
```

Large technical change:

Start with related links and a concise explanation. Add examples, before/after snippets, or a TODO checklist only where prose alone would make the behavior difficult to review.

These are patterns, not templates. Remove any element that does not add information.

## Output

Return only the proposed Markdown unless a brief caveat is necessary.
