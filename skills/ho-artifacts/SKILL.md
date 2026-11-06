---
name: ho-artifacts
description: >-
  Author visual artifacts, either Markdown notes with SVG figures or self-contained HTML pages, iterate on them locally (alongside ho-dev-notes), and share them via gists on request. Use only when the user explicitly invokes "ho-artifacts".
---

# Artifacts

Turn a dev process (PR review, architecture exploration, bug triage, design exploration) into something visual when a picture, a layout, or interaction communicates better than plain Markdown.

This skill leaves the content to you and fixes only the workflow around it. The deliverable is a local file next to the topic's notes, which the user opens directly. Share it only when the user asks.

## Authoring

### Choose the medium

Pick the lightest medium that carries the material, because a richer medium only costs iteration time when a lighter one would do:

1. **Markdown alone** when text, tables, and code blocks are enough. That is a plain `ho-dev-notes` note, not an artifact.
2. **Markdown with SVG figures** when each picture can be static and simple to draw. Narrative explanations usually belong here: short steps in Markdown, each paired with a figure that shows that step's point.
3. **HTML** when the material needs a page: a diagram whose layout is easier to get right with HTML and CSS than with hand-placed SVG coordinates, motion or manipulation that is itself the point, a UI mockup or a dense side-by-side comparison, or computation from inputs or data.

A Markdown note can link to a small HTML page for the one part that needs it. When the request leaves the medium open, pick one and name it in your reply so the user can redirect before the details matter.

### Write for the reader

Pitch the content at the reader's evident background, which means assuming the prerequisites the conversation shows they have instead of simplifying until the text turns vague.

Optimize for iteration speed over styling. Skip theming, dark mode, and visual polish that does not help the reader understand. For figures that plot data, a `dataviz` skill, when available, guides form and color, but skip its dark-mode, hover, and table steps in static SVG figures and first drafts.

Beyond that, organize the content however you judge most effective for the request and the material, and write the first draft without reaching for a template or the references.

### Get it right

Accuracy is the one hard constraint. Inspect the material in full before drafting, such as the complete diff and enough surrounding code to explain behavior, and treat earlier explorations as context rather than a specification. Verify every claim and drawn structure against the actual code, and keep illustrative values distinguishable from measured ones.

Then render the artifact and look at it before handing it over, because a text check cannot catch overlapping labels, arrows that miss their boxes, or content that overflows. Fix what you see.

## Iteration

The user reviews the draft and steers from there. `references/` holds material to bring in at that point, when the user asks for it or the feedback calls for it:

- `explain-diff.md`: fitting a page about a change to its reader.
- `patterns.md`: provenance links, navigation, and code highlighting.
- `sharing.md`: publishing an artifact as a gist. Read it when the user asks to share.
- `archive/`: the retired, more prescriptive version of this skill. Read it only when the user points to it.

## Mechanics

### Location

Author artifacts in the topic directory of `ho-dev-notes`, which is `${XDG_DATA_HOME:-~/.local/share}/ho-dev-notes/<project-name>/<topic-slug>/`, so they live next to the topic's notes. That skill defines how to name the project and topic. If there is no topic, use a temporary directory.

### Markdown with SVG

Put figures in an `images/` directory in the topic directory and embed them with relative links, which the local Markdown preview renders. Make each SVG show one point, and state that point in the image alt text. Give each SVG `width` and `height` equal to its `viewBox`, and size text in those units as page pixels, so a figure displays at its drawn size instead of stretching to the preview width.

### HTML

Keep the page in one self-contained `.html` file. External scripts and styles from a CDN are fine when pinned to exact versions, as long as the page stays readable without them.
