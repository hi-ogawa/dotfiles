# Pattern Anchors

Optional meta reference for established local patterns and external structural inspiration. These are anchors rather than templates, so borrow the useful behavior or structure while allowing natural visual and implementation variation.

## Established patterns

These patterns come from our own artifact iterations.

### Navigation shell

For vertically stacked artifacts with roughly four or more major sections. Short artifacts do not need navigation merely to satisfy a template.

- Use a sticky `<details>` dropdown aligned above the content.
- Let it overlay the page rather than occupy a layout column, preserving the full content width.
- Give every major section a stable, descriptive `id` and link every table-of-contents entry to it.
- Make each section heading a link to its own fragment so the URL can be opened or shared directly.
- Use an anchor offset such as `scroll-margin-top` so fragment targets remain clear of the sticky control.
- Keep the implementation static and usable without JavaScript.
- Pattern anchor: [adaptive browser sessions](https://artifacts.hiro18181.workers.dev/vitest-pr-10726-adaptive-sessions).

## External structural anchors

The following structures were collected from [the unreasonable effectiveness of HTML](https://claude.com/blog/using-claude-code-the-unreasonable-effectiveness-of-html) and its examples.

### Phased plan

Implementation or migration plan; before/after or phased narrative.

- Candidate pipeline: summary strip → milestone timeline → rendered data-flow SVG → key code → risks → open questions.
- A timeline can make ordering and scope skimmable; a data-flow SVG earns its place when paths are visually different, such as request flow versus realtime fan-out.
- Mockups earn their place only when they clarify placement/nesting — not pixel-perfect UI theater.
- Ref: https://thariqs.github.io/html-effectiveness/16-implementation-plan.html

### Code understanding

Onboarding to an unfamiliar codebase or request path.

- Candidate pipeline: one-sentence invariant → architecture/path diagram → step-by-step file tour → key files → gotchas.
- Prefer the mental model first when it gives the reader a useful trust boundary, then ground it in files.
- Ref: https://thariqs.github.io/html-effectiveness/04-code-understanding.html

### Feature explainer

Explain a feature when the reader should jump by question, not read linearly.

- Candidate pipeline: TL;DR → page nav → navigable request path → concrete config example → gotchas → FAQ.
- HTML helps because native expandable steps, static config/code views, and anchors let the reader jump rather than scroll.
- Ref: https://thariqs.github.io/html-effectiveness/14-research-feature-explainer.html

### Option comparison

Weigh N approaches against each other.

- Candidate pipeline: N options with an identical schema (code / pros / cons / metrics) → compact tradeoff facts → recommendation → revisit trigger.
- Same-schema comparison kept spatially parallel is the point; in Markdown this collapses into a long sequential scroll. Not just prettier cards.
- Ref: https://thariqs.github.io/html-effectiveness/01-exploration-code-approaches.html
