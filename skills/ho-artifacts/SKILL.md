---
name: ho-artifacts
description: >-
  Author self-contained HTML visualization artifacts with a consistent visual style, iterate on them locally (alongside ho-dev-notes), and optionally publish them to the public artifacts host. Use only when the user explicitly invokes "ho-artifacts".
---

# Artifacts

## Purpose

Turn a dev process (PR review, architecture exploration, bug triage) into a single self-contained HTML page that communicates the finding with high visual impact, then optionally share it via a public URL.

## Location

Author the `.html` inside the relevant `ho-dev-notes` topic dir (per that skill's convention) so it lives next to its note and iterates as understanding improves. If there is no note, scratch in a temp dir.

## Authoring Rubric

A page that reads at a glance and stays accurate to the code:

- **Self-contained.** One `.html` file. All CSS inline in `<style>`; inline any SVG. No external fonts, CDNs, or network/runtime JS dependencies — it must render offline and as a static asset.
- **Lead with the narrative.** Open with the core story (often a before/after or comparison), not raw detail. Detail tables and code refs come after.
- **Legend first.** Define the meaning of every color and token up front so the reader decodes the rest quickly.
- **One token per recurring concept.** When an entity appears more than once (e.g. "a Vite server instance"), define a single reusable visual token — an icon + chip via an SVG `<symbol>` + `<use>` sprite — and use the *same* token everywhere it occurs. This makes instances recognizable and countable at a glance (e.g. "2 servers before → 1 after"). Never restyle the same concept differently in different places.
- **Separate entities from labels.** Keep the color/shape language for *entities* (servers, configs) distinct from phase/status *badges*, so a color never means two things.
- **Summarize.** Include an at-a-glance differences table for before/after work.
- **Anchor to code.** Put `file.ts:line` references on nodes. Verify every architectural claim against the actual diff/code before drawing it — do not invent structure. If a claim is corrected later, fix the visualization, don't paper over it.
- **House style.** Dark GitHub-ish palette, rounded panels, vertical flow with arrows, two-column before/after grid. Reuse it across artifacts unless the user wants otherwise.

## Publishing

Optional, only when the user wants it public. Target repo `~/code/personal/artifacts`, where `src/` is served at the site root via a Cloudflare worker at `https://artifacts.hiro18181.workers.dev`.

1. Copy to `src/<slug>.html` (slug usually `<project>-<topic>`, e.g. `vitest-pr-10554`).
2. Link it from `src/index.html`.
3. Commit and push `main` — Cloudflare deploys on push.

The page then lives at `https://artifacts.hiro18181.workers.dev/<slug>`.

## Guardrails

- **Public repo.** Anyone with the URL can read it. No secrets, tokens, absolute home paths, private hostnames, or unreleased details. If the content might be sensitive, confirm before publishing.
