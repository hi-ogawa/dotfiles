# Pattern Anchors

Optional meta reference: a catalog of known artifact structures, partly kept for
future iteration of this skill. Each maps a common dev situation to a reusable
section pipeline. Usually one structure fits a page best. The linked examples
are pattern anchors, not house style — borrow the structure, keep our own visual
style.

Origin: [the unreasonable effectiveness of HTML](https://claude.com/blog/using-claude-code-the-unreasonable-effectiveness-of-html).

## Phased plan

Implementation or migration plan; before/after or phased narrative.

- Pipeline: summary strip → milestone timeline → rendered data-flow SVG → key code → risks → open questions.
- The timeline makes ordering and scope skimmable; the data-flow SVG is the real win (e.g. request path vs realtime fan-out are visually different, not just described).
- Mockups earn their place only when they clarify placement/nesting — not pixel-perfect UI theater.
- Ref: https://thariqs.github.io/html-effectiveness/16-implementation-plan.html

## Code understanding

Onboarding to an unfamiliar codebase or request path.

- Pipeline: one-sentence invariant → architecture/path diagram → step-by-step file tour → key files → gotchas.
- Give the mental model first (big-picture trust boundary), then ground it in files via the numbered walkthrough.
- Ref: https://thariqs.github.io/html-effectiveness/04-code-understanding.html

## Feature explainer

Explain a feature when the reader should jump by question, not read linearly.

- Pipeline: TL;DR → page nav → navigable request path → concrete config example → gotchas → FAQ.
- HTML helps because expandable steps + config/code tabs + anchors let the reader jump rather than scroll.
- Ref: https://thariqs.github.io/html-effectiveness/14-research-feature-explainer.html

## Option comparison

Weigh N approaches against each other.

- Pipeline: N options with an identical schema (code / pros / cons / metrics) → compact tradeoff facts → single recommendation → revisit trigger.
- Same-schema comparison kept spatially parallel is the point; in Markdown this collapses into a long sequential scroll. Not just prettier cards.
- Ref: https://thariqs.github.io/html-effectiveness/01-exploration-code-approaches.html
