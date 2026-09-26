---
name: ho-artifacts
description: >-
  Author self-contained HTML visualization artifacts, iterate on them locally (alongside ho-dev-notes), and optionally share or publish them. Use only when the user explicitly invokes "ho-artifacts".
---

# Artifacts

Turn a dev process (PR review, architecture exploration, bug triage) into a single HTML page when a picture, a layout, or interaction makes the finding easier to understand than Markdown, then optionally share it.

This skill fixes the workflow around the page, not the page itself. The mechanics below are required so artifacts stay easy to find, trace, and share. How the page looks and is structured is up to the author and the request.

## Authoring

Decide the form from the request, not from a template.

- **Start from the reader.** Name who will read the page and what they should come away with, for example a reviewer following a PR link, someone onboarding to a subsystem, or the user weighing options. Let that decide the scope, depth, and shape.
- **Show a concrete case early.** Walk one scenario, value, or before-and-after through the idea before abstracting it or showing code.
- **Every visual earns its place.** A diagram, color, or layout should change how something is understood. Leave out what does not.
- **Stay true to the code.** Verify every claim and every drawn structure against the actual code before publishing, and keep illustrative values distinguishable from measured ones.

`references/` holds optional reading: `explain-diff.md` for pages about a change, `standalone-apps.md` for small browser tools, and `patterns.md` for past artifacts and reusable snippets.

## Mechanics

### File

Keep the artifact in one self-contained `.html` file. External scripts and styles from a CDN are fine when pinned to exact versions, as long as the page stays readable without them.

### Location

Author the file inside the relevant `ho-dev-notes` topic directory, following that skill's convention, so it lives next to its note. If there is no note, use a temporary directory.

### Provenance

Link the repo, PR, and issue near the top from the first draft, because the page travels without its surrounding context. Link code as `file.ts:line` using GitHub permalinks pinned to a commit SHA, and upgrade any unpinned links before publishing.

### GistHost

For lightweight or temporary sharing, create an unlisted gist:

```bash
gh gist create app.html --desc "App description"
```

Open it through GistHost:

```text
https://gisthost.github.io/?<gist-id>/<filename>
```

Unlisted gists are readable by anyone with the URL, and GistHost pages share a third-party origin. Check for secrets, local paths, and sensitive data first, and give browser storage an app-specific prefix.

### Artifacts Repository

Publish to the artifacts host only when the user wants it public. The target repo is `~/code/personal/artifacts`, where `src/` is served at the site root by a Cloudflare worker at `https://artifacts.hiro18181.workers.dev`.

The repo is public. Before copying, committing, or pushing, check for secrets, tokens, absolute home paths, private hostnames, and unreleased details, and confirm before publishing anything that might be sensitive.

1. Copy the file to `src/<slug>.html`, usually with a `<project>-<topic>` slug.
2. Link it from `src/index.html`.
3. Commit and push `main`. Cloudflare deploys on push.

The page then lives at `https://artifacts.hiro18181.workers.dev/<slug>`. Return that URL after pushing without polling the deployment.

### Screenshot

To review the rendered page as an image, capture it with Playwright's one-shot command, writing the PNG to a temporary location with absolute paths:

```bash
npx -y playwright screenshot --full-page \
  "file:///absolute/path/to/artifact.html" \
  "/temporary/path/to/preview.png"
```

Omit `--full-page` when the viewport itself is the composition. If the bundled browser is missing, run the command through a project's installed Playwright instead, for example `pnpm exec playwright screenshot`. Iterating with the user's review matters more than rendered verification.
