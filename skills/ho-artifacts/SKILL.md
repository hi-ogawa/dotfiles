---
name: ho-artifacts
description: >-
  Author self-contained HTML visualization artifacts, iterate on them locally (alongside ho-dev-notes), and share them for review via GistHost. Use only when the user explicitly invokes "ho-artifacts".
---

# Artifacts

Turn a dev process (PR review, architecture exploration, bug triage) into a single HTML page when a picture, a layout, or interaction makes the finding easier to understand than Markdown, then optionally share it.

This skill fixes the workflow around the page, not the page itself. The mechanics below are required so artifacts stay easy to find, trace, and share. How the page looks and is structured is up to the author and the request.

## Authoring

Decide the form from the request, not from a template.

- **Start from the reader.** Name who will read the page and what they should come away with, for example a reviewer following a PR link, someone onboarding to a subsystem, or the user weighing options. Let that decide the scope, depth, and shape.
- **Show a concrete case early.** Walk one scenario, value, or before-and-after through the idea before abstracting it or showing code.
- **Every visual earns its place.** A diagram, color, or layout should change how something is understood. Leave out what does not.
- **Stay true to the code.** Verify every claim and every drawn structure against the actual code before sharing, and keep illustrative values distinguishable from measured ones.

`references/` holds optional reading: `explain-diff.md` for pages about a change, `standalone-apps.md` for small browser tools, and `patterns.md` for reusable snippets.

`references/archive/` keeps the retired, more prescriptive version of this skill for reference. Read it only when the user points to it.

## Mechanics

### File

Keep the artifact in one self-contained `.html` file. External scripts and styles from a CDN are fine when pinned to exact versions, as long as the page stays readable without them.

### Location

Author the file inside the relevant `ho-dev-notes` topic directory, following that skill's convention, so it lives next to its note. If there is no note, use a temporary directory.

### Provenance

Link the repo, PR, and issue near the top from the first draft, because the page travels without its surrounding context. Link code as `file.ts:line` using GitHub permalinks pinned to a commit SHA, and upgrade any unpinned links before sharing.

### GistHost

To share a page for review, create an unlisted gist and send the user the GistHost URL. The user reviews the rendered page directly, so iterate on their feedback rather than rendering it yourself.

```bash
gh gist create app.html --desc "App description"
```

Open it through GistHost:

```text
https://gisthost.github.io/?<gist-id>/<filename>
```

Unlisted gists are readable by anyone with the URL, and GistHost pages share a third-party origin. Check for secrets, local paths, and sensitive data first, and give browser storage an app-specific prefix.
