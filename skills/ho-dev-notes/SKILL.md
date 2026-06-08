---
name: ho-dev-notes
description: >-
  Personal local investigation notes under ~/.local/share/ho-dev-notes. Use only when the user explicitly mentions "ho-dev-notes". Do not trigger merely because a task involves bug investigation, PR review, architecture exploration, or code analysis.
---

# Dev Notes Convention

A personal convention for local-only investigation notes and artifacts. Notes live outside repo worktrees so they stay together when the same repository has multiple worktrees.

## Purpose

Keep durable working notes without committing them:

- PR reviews and code analysis
- Bug investigation notes
- Architecture explorations
- Scratch files and experiments

## Base Directory

Use this base directory:

```text
${XDG_DATA_HOME:-~/.local/share}/ho-dev-notes
```

## Directory Structure

```
~/.local/share/ho-dev-notes/
  <project-name>/
    <topic-slug>/
      <note>.md
      artifacts...
```

Use project directory name for `<project-name>`. If the project directory is a git worktree, check main worktree's directory name (the first item in `git worktree list`) for the project name. If the project is not a git repo, use a descriptive name.

Each topic gets a directory, not only a markdown file, so related repros, logs, screenshots, or fixtures can sit beside the note. Use the primary filename that matches the workflow, such as `NOTE.md`, `TRIAGE.md`, or `REVIEW.md`.

## Note Header

Start each note with enough source context to reconnect it to the exact checkout:

```markdown
# <Title>

- Repo: <remote-url-or-local-repo-key>
- Commit: <sha>
- Branch: <branch>
- Worktree: <absolute path>
```

Use `git rev-parse --show-toplevel`, `git remote get-url origin`, `git rev-parse HEAD`, and `git branch --show-current` when the note is tied to a git repo.

## Clickable Source Links

Because notes live outside the repo, use `file://` links plus a repo-relative fallback:

```markdown
The issue starts in [packages/runner/src/suite.ts:918](file:///home/hiroshi/code/repo/packages/runner/src/suite.ts#L918).
```

## Sharing via Gist

<!-- TODO: move or remove gist gotchas -->

Use `gh gist create` to share notes for PR reviews. Always use `-d` to set a description; without it, the gist title defaults to the filename. `-p` makes the gist public.

```bash
# Single file
gh gist create -p -d "pretty-format OOM when printing large objects (#9329)" ~/.local/share/ho-dev-notes/project-name/pretty-format-oom-9329/NOTE.md

# Multiple files in one gist
gh gist create -p -d "snapshot serializer investigation" ~/.local/share/ho-dev-notes/project-name/snapshot-serializer/*
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
