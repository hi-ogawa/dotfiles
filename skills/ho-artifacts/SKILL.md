---
name: ho-artifacts
description: >-
  Author self-contained HTML visualization artifacts, iterate on them locally (alongside ho-dev-notes), and optionally publish them to the public artifacts host. Use only when the user explicitly invokes "ho-artifacts".
---

# Artifacts

## Reference Note

`references/patterns.md` catalogs established local patterns and external structural anchors. When an artifact needs navigation, read and follow its canonical navigation shell. Consult the other patterns for inspiration when picking a layout, and mine them when iterating on this skill.

## Purpose

Turn a dev process (PR review, architecture exploration, bug triage) into a single self-contained HTML page when visual encoding, rendered diagrams, or nonlinear layout makes the finding easier to inspect than Markdown — then optionally share it via a public URL.

## Why HTML

HTML is worth the effort when it materially improves inspection over plain prose. Build the artifact around at least one of these advantages — and let that advantage drive the layout:

- **Visual encoding:** color/shape/size correlates or contrasts concepts.
- **Embedded visual components:** rendered flows, connections, diagrams, callouts.
- **Nonlinear reading:** columns, boxes, anchors, or progressive disclosure reduce cognitive load.

Aim for inspection value, not decoration: the page should change how the finding is read, not just style the prose.

## Location

Author the `.html` inside the relevant `ho-dev-notes` topic dir (per that skill's convention) so it lives next to its note and iterates as understanding improves. If there is no note, scratch in a temp dir.

## Authoring Rubric

A page that reads at a glance and stays accurate to the code:

- **Self-contained.** One `.html` file, all CSS and SVG inline. No external fonts, CDNs, or runtime JS — it must render offline as a static asset.
- **Consistent visual language.** Reuse the same color, shape, or token for the same concept everywhere. When those encodings carry meaning that is not obvious, define them in a legend up front.
- **Provenance from the first draft.** Include high-level pointers — repo, PR, issue — as clickable links from the initial draft, not just at publish time. They are durable and inexpensive because the prose usually cites them already. A self-contained artifact travels without its surrounding context, so it needs provenance even more than the note beside it.
- **Anchor to code.** Reference the relevant `file.ts:line`, and verify every claim against the actual code before drawing it — don't invent structure. Prefer pinned GitHub permalinks tied to a commit SHA. Add or upgrade these at publish time.
- **Minimal style.** Default to light mode (light background, dark text). Keep it clean and restrained — limited palette, clear hierarchy, generous whitespace, one primary font with monospace reserved for code, and no full-uppercase emphasis — so the content stays the focus. Avoid decoration that does not encode information; pick the rest per artifact.
- **Progressive disclosure.** Lead with the idea and observable behavior; move implementation detail later. Keep the artifact focused on its stated purpose.
- **Semantic fidelity.** Visual simplification must preserve the causal units and boundaries that matter. Keep examples internally consistent and distinguish illustrative values from measurements.
- **Navigation.** For vertically stacked artifacts with roughly four or more major sections, use one zero-height sticky `<details>` before the main content. Give its `<summary>` and absolutely positioned `<nav>` separate opaque surfaces so the control overlays the page without reducing content width. Link stable section IDs, make headings self-linking, and offset fragment targets. Follow the canonical navigation shell in `references/patterns.md`.

## Publishing

Publish only when the user wants it public. Target repo `~/code/personal/artifacts`, where `src/` is served at the site root via a Cloudflare worker at `https://artifacts.hiro18181.workers.dev`.

**Public repo.** Anyone with the URL can read it. Before copying, committing, or pushing, check for secrets, tokens, absolute home paths, private hostnames, and unreleased details. If the content might be sensitive, confirm before publishing.

1. Copy to `src/<slug>.html` (slug usually `<project>-<topic>`).
2. Link it from `src/index.html`.
3. Commit and push `main` — Cloudflare deploys on push.

The page then lives at `https://artifacts.hiro18181.workers.dev/<slug>`.

After a successful push, return the expected URL without polling deployment availability.

## Guardrails

- Artifacts support lightweight review, so rendered-content verification is not required.
