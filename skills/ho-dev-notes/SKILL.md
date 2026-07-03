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

## Source Links

Because notes live outside the repo, link to source with a path **relative to the note file**, and use the repo-relative `path:line` as the link text so the reference stays readable even if the path later breaks:

```markdown
The issue starts in [src/foo/bar.ts:42](../../../../../code/myrepo/src/foo/bar.ts#L42).
```

- Use `#Lnnn` for the line anchor. VS Code Markdown preview opens the file and jumps to the line.
- The relative path is from the note's directory to the file under the `Worktree:` path in the header. Compute it rather than hand-counting `../`:

```sh
node -e "console.log(require('path').relative(process.argv[1], process.argv[2]))" \
  "$note_dir" "$worktree/src/foo/bar.ts"
```

When a note is meant to be shared (for example published as a gist), use a public GitHub permalink instead, built from the `Repo`, `Commit`, and path in the header so it stays pinned to the exact checkout:

```markdown
[src/foo/bar.ts:42](https://github.com/<owner>/<repo>/blob/<commit-sha>/src/foo/bar.ts#L42)
```

## Markdown Style

Do not hard-wrap prose paragraphs in Markdown unless explicitly asked.
