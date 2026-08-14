import { readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";

function main() {
  const [inputPath, outputPath] = process.argv.slice(2);
  if (!inputPath || !outputPath) {
    throw new Error("Usage: render.mjs <input.json> <output.html>");
  }
  const data = JSON.parse(readFileSync(inputPath, "utf8"));
  const { nodes, roots } = buildIndex(data);
  const rootEntries = data.roots.map((root, index) => ({
    root,
    number: String(index + 1).padStart(2, "0"),
    anchor: `root-${index + 1}-${slugify(root)}`,
  }));
  const rootAnchors = new Map(rootEntries.map(({ root, anchor }) => [root, anchor]));
  const sections = rootEntries
    .map(({ root, number, anchor }) => {
      return `<section class="root-section" id="${anchor}">
        <header class="root-heading"><span>${number}</span><h2><a href="#${anchor}">${escapeHtml(root)}</a></h2></header>
        <ol class="tree root-tree">${renderOccurrence(root, new Set(), root, nodes, roots, rootAnchors)}</ol>
      </section>`;
    })
    .join("");
  const html = renderDocument(data, inputPath, rootEntries, sections);

  writeFileSync(outputPath, html);
  console.log(
    `Rendered ${data.nodes.length} nodes across ${data.roots.length} roots to ${outputPath}`,
  );
}

function buildIndex(data) {
  if (!Array.isArray(data.roots) || !Array.isArray(data.nodes)) {
    throw new Error("Input must contain roots and nodes arrays");
  }

  const nodes = new Map();
  for (const node of data.nodes) {
    if (typeof node.id !== "string" || (node.calls !== undefined && !Array.isArray(node.calls))) {
      throw new Error("Every node must contain a string id; calls must be an array when present");
    }
    if (nodes.has(node.id)) throw new Error(`Duplicate node id: ${node.id}`);
    nodes.set(node.id, { ...node, calls: node.calls ?? [] });
  }

  const roots = new Set(data.roots);
  for (const root of roots) {
    if (!nodes.has(root)) throw new Error(`Missing root node: ${root}`);
  }

  return { nodes, roots };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function slugify(value) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "entry"
  );
}

function renderOccurrence(id, ancestors, activeRoot, nodes, roots, rootAnchors) {
  const node = nodes.get(id);
  const missing = !node;
  const recursive = ancestors.has(id);
  const separateRoot = id !== activeRoot && roots.has(id);
  const classes = ["node"];
  if (missing) classes.push("missing");
  if (recursive) classes.push("recursive");
  if (separateRoot) classes.push("root-reference");

  const marker = missing ? "unresolved" : "";
  const nameHtml = separateRoot
    ? `<a class="name root-link" href="#${rootAnchors.get(id)}">${escapeHtml(node.id)}</a>`
    : `<code class="name">${escapeHtml(node?.id ?? id)}</code>`;
  const markerHtml = marker ? `<span class="marker">${escapeHtml(marker)}</span>` : "";
  const identity = `<div class="identity">
      ${nameHtml}
      ${markerHtml}
      ${node?.source ? `<code class="definition">${escapeHtml(node.source)}</code>` : ""}
    </div>`;
  const note = node?.note ? `<p class="node-note">${escapeHtml(node.note)}</p>` : "";

  let children = "";
  if (node && !recursive && !separateRoot && node.calls.length > 0) {
    const nextAncestors = new Set(ancestors).add(id);
    children = `<ol>${node.calls
      .map((call) => {
        if (typeof call.to !== "string") throw new Error(`Call from ${id} is missing string to`);
        return renderOccurrence(call.to, nextAncestors, activeRoot, nodes, roots, rootAnchors);
      })
      .join("")}</ol>`;
  }

  return `<li class="${classes.join(" ")}"><article>${identity}${note}</article>${children}</li>`;
}

function renderDocument(data, inputPath, rootEntries, sections) {
  const rootIndex = rootEntries
    .map(
      ({ root, number, anchor }) =>
        `<a href="#${anchor}"><span>${number}</span>${escapeHtml(root)}</a>`,
    )
    .join("");
  const rootNavigation =
    rootEntries.length > 1
      ? `<details class="toc">
      <summary>Roots</summary>
      <nav aria-label="Call-chain roots">${rootIndex}</nav>
    </details>`
      : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Narrated Call Chain</title>
  <style>
    :root {
      color-scheme: light;
      --paper: #f4f1ea;
      --surface: #fffefa;
      --ink: #202421;
      --muted: #6c726d;
      --source: #66758a;
      --faint: #aeb4ae;
      --line: #d7d5cc;
      --accent: #245f4b;
      --accent-soft: #e8f1ec;
      --alert: #93443c;
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--paper);
      color: var(--ink);
      font: 14px/1.48 ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    .shell { width: min(1180px, calc(100% - 36px)); margin: 0 auto; }
    .page-header {
      padding: 14px 0;
      border-bottom: 1px solid var(--line);
      background: var(--surface);
    }
    .header-row { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: flex-start; gap: 6px 18px; }
    h1 { margin: 0; font-size: 17px; line-height: 1.2; letter-spacing: -0.015em; }
    .meta { margin: 0; color: var(--muted); font-size: 11px; }
    .meta code { color: var(--ink); }
    main { padding: 24px 0 44px; }
    .toc {
      position: fixed;
      top: 10px;
      right: max(30px, calc((100vw - 1180px) / 2 + 12px));
      z-index: 10;
      width: min(300px, calc(100vw - 36px));
      font: 11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    }
    .toc summary {
      width: max-content;
      margin-left: auto;
      padding: 6px 10px;
      border: 1px solid var(--line);
      border-radius: 7px;
      background: var(--surface);
      box-shadow: 0 2px 8px rgb(32 36 33 / 10%);
      color: var(--muted);
      cursor: pointer;
      list-style: none;
    }
    .toc summary::-webkit-details-marker { display: none; }
    .toc summary::after { content: " ▾"; color: var(--faint); }
    .toc[open] summary::after { content: " ▴"; }
    .toc nav {
      position: absolute;
      top: 36px;
      right: 0;
      width: 100%;
      padding: 7px;
      border: 1px solid var(--line);
      border-radius: 9px;
      background: var(--surface);
      box-shadow: 0 8px 24px rgb(32 36 33 / 14%);
    }
    .toc nav a {
      display: block;
      padding: 6px 8px;
      border-radius: 5px;
      color: var(--muted);
      text-decoration: none;
    }
    .toc nav a:hover { background: var(--accent-soft); color: var(--ink); }
    .toc nav span { display: inline-block; width: 24px; color: var(--faint); }
    .root-section {
      scroll-margin-top: 64px;
      margin-bottom: 28px;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: var(--surface);
      overflow: hidden;
    }
    .root-heading {
      display: grid;
      grid-template-columns: 24px minmax(0, 1fr);
      align-items: center;
      gap: 8px;
      padding: 13px 18px;
      border-bottom: 1px solid var(--line);
      background: #faf9f4;
    }
    .root-heading span { color: var(--faint); font: 700 11px/1 ui-monospace, monospace; }
    .root-heading h2 { margin: 0; font: 650 15px/1.2 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    .root-heading a { color: inherit; text-decoration: none; }
    .root-heading a:hover { color: var(--accent); }
    .tree, .tree ol { margin: 0; padding: 0; list-style: none; }
    .root-tree { padding: 17px 20px 21px; overflow-x: auto; }
    .tree ol { position: relative; margin-left: 13px; padding-left: 22px; }
    .tree li > ol { margin-top: 5px; }
    .tree ol::before {
      content: "";
      position: absolute;
      top: 0;
      bottom: 16px;
      left: 0;
      border-left: 1px solid var(--line);
    }
    .tree li { position: relative; min-width: 0; padding: 4px 0; }
    .tree ol > li::before {
      content: "";
      position: absolute;
      top: 13px;
      left: -22px;
      width: 16px;
      border-top: 1px solid var(--line);
    }
    .tree ol > li:last-child::after {
      content: "";
      position: absolute;
      top: 14px;
      bottom: 0;
      left: -22px;
      border-left: 3px solid var(--surface);
    }
    article { position: relative; z-index: 1; min-width: 540px; }
    .identity {
      display: grid;
      grid-template-columns: max-content max-content minmax(220px, 1fr);
      gap: 8px;
      align-items: baseline;
      min-height: 18px;
    }
    .name { color: var(--ink); font: 720 13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    .root-link {
      padding: 1px 5px;
      border-radius: 4px;
      background: var(--accent-soft);
      color: var(--accent);
      text-decoration: underline;
      text-decoration-color: color-mix(in srgb, var(--accent) 45%, transparent);
      text-underline-offset: 2px;
    }
    .root-link:hover { color: var(--ink); }
    .definition {
      justify-self: end;
      color: var(--source);
      font-size: 10px;
      overflow-wrap: anywhere;
      text-align: right;
    }
    .marker {
      padding: 1px 6px;
      border-radius: 999px;
      background: var(--accent-soft);
      color: var(--accent);
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-decoration: none;
      text-transform: uppercase;
    }
    .missing .marker { background: #f7e5e2; color: var(--alert); }
    .node-note { max-width: 780px; margin: 2px 0 3px; color: var(--muted); font-size: 13px; }
    @media (max-width: 760px) {
      .shell { width: min(100% - 20px, 1180px); }
      .root-tree { padding-inline: 13px; }
      .tree ol { margin-left: 8px; padding-left: 17px; }
      .tree ol > li::before { left: -17px; width: 12px; }
      .tree ol > li:last-child::after { left: -17px; }
      article { min-width: 420px; }
      .identity { grid-template-columns: max-content max-content minmax(160px, 1fr); }
    }

    @media print {
      body { background: white; }
      .shell { width: 100%; }
      .root-section { break-inside: avoid-page; border-color: #bbb; }
    }
  </style>
</head>
<body>
  <header class="page-header">
    <div class="shell header-row">
      <h1>Call chain</h1>
      <p class="meta">Dataset <code>${escapeHtml(basename(inputPath))}</code> · ${data.nodes.length} nodes · ${data.roots.length} roots</p>
      ${rootNavigation}
    </div>
  </header>
  <main class="shell">${sections}</main>
</body>
</html>`;
}

try {
  main();
} catch (error) {
  console.error(`ho-call-chain: ${error.message}`);
  process.exitCode = 1;
}
