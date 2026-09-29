# Patterns

Optional reading. These patterns solve recurring needs so they do not need to be reinvented. Use them when they help the page at hand, and ignore them otherwise.

## Provenance

When the page will travel without its surrounding context, link the repo, PR, and issue near the top. Link code as `file.ts:line` using GitHub permalinks pinned to a commit SHA, so the links keep pointing at the code the page describes.

## Navigation shell

A table of contents for long, vertically stacked pages that stays out of the content's width.

- Use one self-contained, zero-height sticky `<details>` element before the main content so it overlays the page and sticks immediately without reducing content width.
- Render the collapsed trigger with `<summary>` and position the expanded `<nav>` absolutely below it. Give both elements their own opaque background, border, and shadow.
- Give every major section a stable, descriptive `id` and link every table-of-contents entry to it.
- Make each section heading a link to its own fragment so the URL can be opened or shared directly.
- Use an anchor offset such as `scroll-margin-top` so fragment targets remain clear of the sticky control.
- Keep the implementation static and usable without JavaScript.
- Example: [adaptive browser sessions](https://artifacts.hiro18181.workers.dev/vitest-pr-10726-adaptive-sessions).

Structure:

```html
<main class="wrap">
  <details class="toc">
    <summary>Contents</summary>
    <nav aria-label="Page sections">
      <a href="#overview">Overview</a>
      <a href="#details">Details</a>
    </nav>
  </details>
  <!-- Main content follows. -->
</main>
```

```css
.toc {
  position: sticky;
  top: var(--toc-sticky-offset);
  z-index: var(--toc-layer);
  width: var(--toc-width);
  height: 0;
  margin-left: auto;
}
.toc summary {
  padding: var(--toc-trigger-padding);
  border: 1px solid var(--line);
  border-radius: var(--toc-radius);
  background: var(--toc-surface);
  box-shadow: var(--toc-trigger-shadow);
  cursor: pointer;
  list-style: none;
}
.toc nav {
  position: absolute;
  top: calc(100% + var(--toc-menu-gap));
  right: 0;
  width: 100%;
  padding: var(--toc-menu-padding);
  border: 1px solid var(--line);
  border-radius: var(--toc-radius);
  background: var(--toc-surface);
  box-shadow: var(--toc-menu-shadow);
}
section[id] { scroll-margin-top: var(--toc-anchor-offset); }
```

## Code highlighting

Syntax highlighting for pages with substantial code excerpts, using Prism.js 1.30.0 with its stock Tomorrow theme and autoloader. Mark each block with an explicit language class so highlighting is deterministic. Keep local fallback colors and geometry so code remains readable while Prism loads or when the CDN is unavailable.

Use scoped artifact component names such as `.step-number` because Prism emits generic token classes including `.number`, `.string`, `.keyword`, and `.operator`.

Add the theme in `<head>`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.30.0/themes/prism-tomorrow.min.css">
```

Mark code with its language:

```html
<pre><code class="language-typescript">const value = 1;</code></pre>
```

Keep the artifact's code geometry and fallback surface local:

```css
pre[class*="language-"] {
  overflow: auto;
  background: #2d2d2d;
  color: #ccc;
  text-shadow: none;
}
code[class*="language-"] {
  text-shadow: none;
}
```

Load Prism at the end of `<body>`:

```html
<script>window.Prism = { manual: true };</script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.30.0/components/prism-core.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.30.0/plugins/autoloader/prism-autoloader.min.js"></script>
<script>
  if (window.Prism) {
    if (Prism.plugins?.autoloader) {
      Prism.plugins.autoloader.languages_path =
        "https://cdn.jsdelivr.net/npm/prismjs@1.30.0/components/";
    }
    Prism.highlightAll();
  }
</script>
```

Examples: [rendered toy-midi PR 363 explain-diff](https://gisthost.github.io/?5f0654fb261396e00cc9e7e9264d3f40/toy-midi-pr-363-explain-diff.html) and [raw HTML](https://gist.githubusercontent.com/hi-ogawa-agent/5f0654fb261396e00cc9e7e9264d3f40/raw/toy-midi-pr-363-explain-diff.html).
