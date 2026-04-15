---
name: dev-notes
description: 'Local-only investigation notes in .dev-notes/ (globally gitignored). Use only when the user explicitly mentions dev-notes or an obvious variant such as "dev note" or ".dev-notes". Do not trigger merely because a task involves bug investigation, PR review, architecture exploration, or code analysis.'
---

# .dev-notes Convention

A personal convention for local-only documentation in any codebase. Globally gitignored by personal [dotfiles/.gitignore-global](https://github.com/hi-ogawa/dotfiles/blob/main/.gitignore-global), so it works across all repos without polluting them.

## Activation

Use this skill only when the user explicitly mentions `dev-notes` or an obvious variant such as `dev note` or `.dev-notes`. For ordinary debugging, code review, architecture exploration, or codebase analysis, continue in the conversation unless the user refers to dev-notes.

## Purpose

Keep working notes, investigations, and references alongside code without committing them:

- PR reviews and code analysis
- Bug investigation notes
- Architecture explorations
- Scratch files and experiments

## Directory Structure

```
.dev-notes/
  dist/           # Escape hatch from linting/formatting
    <topic>.md
  <topic>.md      # Topic-specific notes
```

### The `dist/` Trick

Many repos have aggressive linting/formatting on `**/*.md`. Nesting under `dist/` often escapes these rules since build outputs are typically excluded. Adjust based on repo's tooling:

- `.dev-notes/dist/*.md` - if repo lints markdown
- `.dev-notes/*.md` - if no lint rules apply
- Check `.eslintignore`, `.prettierignore`, etc.

## Clickable Source Links

Use relative markdown links with line anchors for navigation:

```markdown
**Location:** [packages/runner/src/suite.ts#L918](../../packages/runner/src/suite.ts#L918)
```

- Path is relative from the markdown file to the source
- Single line `#L123` works in VS Code
- Ranges `#L123-L456` break VS Code jump (works on GitHub though)
- Ctrl+Click in VS Code markdown preview to jump

From `.dev-notes/dist/*.md`, use `../../` to reach repo root.

## Sharing via Gist

Since `.dev-notes/` is gitignored, use `gh gist create` to share notes for PR reviews. Always use `-d` to set a description — without it, the gist title defaults to just the filename. `-p` makes the gist public (default is secret/unlisted, but still accessible via URL).

```bash
# Single file
gh gist create -p -d "pretty-format OOM when printing large objects (#9329)" .dev-notes/pretty-format-oom-9329.md

# Multiple files in one gist
gh gist create -p -d "snapshot serializer investigation" .dev-notes/file1.md .dev-notes/file2.md
```

Then link the gist URL in the PR description. The link persists even if the local file is deleted.

### Updating a Gist

`gh gist edit <id> -f <filename>` with stdin redirect does **not** pipe content — it opens an interactive editor, which silently does nothing in non-interactive environments. To replace a file's content, remove and re-add:

```bash
# Remove old file, then add the new version
gh gist edit <id> -r old-filename.md
gh gist edit <id> -a /path/to/new-file.md
```

To add a new file to an existing gist:

```bash
gh gist edit <id> -a /path/to/file.md
```
