---
name: ho-artifacts
description: >-
  Author visual artifacts, either Markdown notes with SVG figures or self-contained HTML pages, iterate on them locally (alongside ho-dev-notes), and share them for review via gists. Use only when the user explicitly invokes "ho-artifacts".
---

# Artifacts

Turn a dev process (PR review, architecture exploration, bug triage, design exploration) into something visual when a picture, a layout, or interaction communicates better than plain Markdown.

This skill delegates the content to you and fixes only the workflow around it. The mechanics below are required so artifacts stay easy to find and share. Everything else is your call.

## Authoring

### Choose the medium

Pick the lightest medium that carries the material, because a richer medium that Markdown could equally replace only costs iteration time:

1. **Markdown alone** when text, tables, and code blocks are enough. That is a plain `ho-dev-notes` note, not an artifact.
2. **Markdown with SVG figures** when the explanation needs pictures but each picture can be static. Narrative explanations usually belong here: short steps in Markdown, each paired with a figure that shows exactly that step's point.
3. **HTML** only when the material needs what a page alone gives: motion or manipulation that is itself the point, a layout Markdown cannot express such as a UI mockup or a dense side-by-side comparison, or computation from inputs or data.

A Markdown note can link to a small HTML page for the one part that needs it. Do not add interaction as a stand-in for an explanation, or prose as a stand-in for a picture. When the request leaves the medium open, pick one and name it in your reply so the user can redirect before the details matter.

### Write for the reader

Pitch the content at the reader's evident background, which means assuming the prerequisites the conversation shows they have instead of simplifying until the text turns vague.

Optimize for iteration speed over styling. Skip theming, dark mode, and visual polish that does not help the reader understand.

Beyond that, organize the content however you judge most effective for the request and the material. Choose the structure, visuals, and interaction from your own instinct, and write the first draft without reaching for a template or the references.

The one constraint is accuracy. Inspect the material in full first, such as the complete diff and enough surrounding code to explain behavior, and treat earlier explorations as context rather than a specification. Verify every claim and drawn structure against the actual code, and keep illustrative values distinguishable from measured ones.

## Iteration

The user reviews the draft and steers from there. `references/` holds material to bring in at that point, when the user asks for it or the feedback calls for it:

- `explain-diff.md`: fitting a page about a change to its reader.
- `patterns.md`: provenance links, navigation, and code highlighting.
- `archive/`: the retired, more prescriptive version of this skill. Read it only when the user points to it.

## Mechanics

### Location

Author artifacts inside the relevant `ho-dev-notes` topic directory, following that skill's convention, so they live next to their note. If there is no note, use a temporary directory.

### Markdown with SVG

Put figures in an `images/` directory next to the note and embed them with relative links, which the local Markdown preview renders. Make each SVG show one point, and state that point in the image alt text. Give each SVG `width` and `height` equal to its `viewBox`, and size text in those units as page pixels, so a figure displays at its drawn size instead of stretching to the preview width. When a figure plots data, generate it with a small script kept beside it rather than drawing values by hand.

### HTML

Keep the page in one self-contained `.html` file. External scripts and styles from a CDN are fine when pinned to exact versions, as long as the page stays readable without them.

### Sharing

To share an HTML page for review, create an unlisted gist and send the user the GistHost URL. The user reviews the rendered page directly, so iterate on their feedback rather than rendering it yourself.

```bash
gh gist create app.html --desc "App description"
```

Open it through GistHost:

```text
https://gisthost.github.io/?<gist-id>/<filename>
```

To share a Markdown note with SVG figures, publish it as a gist and send the user the gist URL, because gist renders the Markdown itself. Gist breaks relative image links and has no directories, so as a temporary workaround, create the gist first, then update its copy of the note so each image link points to `https://gist.githubusercontent.com/<user>/<gist-id>/raw/<basename>`. Keep the local note's relative links unchanged.

Unlisted gists are readable by anyone with the URL, and GistHost pages share a third-party origin. Check for secrets, local paths, and sensitive data first, and give browser storage an app-specific prefix.
