---
name: ho-artifacts
description: >-
  Author self-contained HTML visualization artifacts, iterate on them locally (alongside ho-dev-notes), and share them for review via GistHost. Use only when the user explicitly invokes "ho-artifacts".
---

# Artifacts

Turn a dev process (PR review, architecture exploration, bug triage) into a single HTML page when a picture, a layout, or interaction makes the finding easier to understand than Markdown, then optionally share it.

This skill delegates the page to you and fixes only the workflow around it. The mechanics below are required so artifacts stay easy to find and share. Everything else is your call.

## Authoring

Organize the page however you judge most effective for the request and the material. Choose the structure, visuals, and interaction from your own instinct, and write the first draft without reaching for a template or the references.

The one constraint is accuracy. Verify every claim and drawn structure against the actual code, and keep illustrative values distinguishable from measured ones.

## Iteration

The user reviews the draft and steers from there. `references/` holds material to bring in at that point, when the user asks for it or the feedback calls for it:

- `explain-diff.md`: fitting a page about a change to its reader.
- `patterns.md`: provenance links, navigation, and code highlighting.
- `archive/`: the retired, more prescriptive version of this skill. Read it only when the user points to it.

When the request is a standalone browser tool rather than an explanatory page, read `references/standalone-apps.md` before starting.

## Mechanics

### File

Keep the artifact in one self-contained `.html` file. External scripts and styles from a CDN are fine when pinned to exact versions, as long as the page stays readable without them.

### Location

Author the file inside the relevant `ho-dev-notes` topic directory, following that skill's convention, so it lives next to its note. If there is no note, use a temporary directory.

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
