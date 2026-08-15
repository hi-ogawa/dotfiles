# Design Rationale And History

This reference records why `ho-call-chain` has its current scope and shape. Read it when iterating on the skill so changes respond to observed workflow friction instead of reopening settled questions without context.

The original local design note and prototype remain at:

```text
~/.local/share/ho-dev-notes/dotfiles/call-chain-review-workflow/
```

That topic contains the longer discussion, a 34-node Vitest warm-modules fixture, the first renderer prototype, and its generated HTML.

## Starting Point

Free-form `ho-dev-notes` and bespoke `ho-artifacts` already worked well for investigation and review. The recurring gap was narrower: a boring, large, multi-file call-chain overview such as:

```text
someFn
  -> thisFn
    -> xFn
  -> thatFn
    -> ...
```

Agents could produce useful versions after repeated prompting, but each attempt mixed code collection, narration, source pointers, and presentation. The goal became making that workflow deterministic and repeatable without turning it into static-analysis infrastructure.

The intended output is a rough local review aid that bootstraps human understanding. Completeness and precise validation are less important than useful roots, concrete intermediate calls, meaningful fan-out, and short narration.

## Evolution

### Separate Collection From Rendering

The first settled decision was to data-fy the collected call structure. Agents should focus on selecting and narrating code facts, while a deterministic renderer should own presentation. This allows renderer iteration without asking agents to regenerate HTML and allows the same collection policy to be dogfooded repeatedly.

Agents should not hand-author Mermaid, HTML, or a prose architecture note as the primary deliverable.

### Store A Graph, Render Trees

A nested tree was initially considered because the desired view is tree-shaped. The intermediate representation instead became graph-shaped because real calls include shared callees, cycles, multiple roots, and independently collected subtrees.

The renderer projects that graph into trees:

- Shared nodes can appear under multiple branches.
- Active-ancestor recursion becomes a reference.
- Another declared root becomes a separate-root reference.
- Multiple roots can represent independent entrypoints or intentionally split deep subtrees.

### Use Node-Owned Outgoing Calls

Separate flat node and edge arrays were considered. The chosen representation stores ordered outgoing calls under each node. This keeps function procedure and fan-out visible in the data while preserving edge-specific metadata.

Conceptually, node and call metadata remain distinct:

- Node `source` is the function definition.
- Node `note` is the function's responsibility in this flow.
- Call `source` is the invocation site.
- Call `note` is invocation context, condition, transition, or significance.

Array order is procedure order, so a separate `order` field is unnecessary.

### Keep The Schema Small

The core schema was deliberately reduced to:

```text
roots
nodes
  id
  source
  note
  calls
    to
    source
    note
```

Dedicated fields for symbol metadata, edge kind, condition, confidence, order, display labels, and layout were rejected as premature. Notes can carry lightweight context. Synthetic nodes can represent RPC, callback, framework, worker, unresolved, or other conceptual transitions.

JSON was selected over YAML for the first implementation because Node parses it without dependencies and agents can emit it reliably. YAML should be reconsidered only if real manual-editing friction justifies a parser dependency.

### Split Responsibility With VS Code

VS Code Call Hierarchy already provides the simultaneous source-level probing workflow:

- Interactive incoming and outgoing expansion.
- Definition and call-site navigation.
- Language-server-backed investigation while reviewing.

`ho-call-chain` should not reproduce that interactivity. Its separate responsibility is the stable whole-flow overview: curated roots, meaningful branches, conceptual edges, narration, and visible source context.

Sources remain plain text by default. The renderer can optionally link definition sources to a supplied GitHub permanent blob URL, but it does not need previews, hover behavior, collapsing, or runtime JavaScript.

### Treat CallDiff As Adjacent

CallDiff demonstrated that deterministic AST-based call extraction, tree rendering, source locations, and call-flow diffs are useful. It is not an exact replacement because this workflow emphasizes agent curation, conceptual edges, narration, root chunking, and use beside VS Code.

Automatic CallDiff bootstrapping remains a possible future input. It is intentionally absent from the first skill so dogfooding can establish what one agent does or does not need.

### Choose Static HTML

Plain text and Markdown were considered as possible projections. Markdown does not distinguish function identity, node narration, sources, and tree rails strongly enough for a large overview.

Static HTML became the chosen output because data traversal is no more conceptually complex than Markdown generation, while CSS provides much more control over:

- Function and note hierarchy.
- Definition source treatment.
- Persistent tree rails.
- Deep indentation.
- Wrapped narration.
- Root section boundaries.
- Density and print layout.

The HTML is self-contained and JavaScript-free. The generator should remain boring. Renderer flexibility comes from semantic markup and CSS, not runtime controls.

### Accept The First Render As A Baseline

The first realistic fixture adapted a Vitest warm-module review into 34 nodes across four roots. It exercised deep nesting, wide fan-out, long paths, node and call notes, root splitting, recursion, a synthetic RPC boundary, and an unresolved review concern.

Full-page inspection showed that the static composition remained readable. The first potential pressure point was repeated full source paths competing with narration, but it was not blocking. Human review accepted the prototype as a sufficient baseline.

This means renderer work should now be incremental and driven by real use. Do not reopen Markdown versus HTML or redesign the entire composition without concrete evidence.

### Hide Edge Metadata In The Render

The intermediate data retains each call's optional source and note, but the rendered tree already expresses calls through nesting. Rendering edge metadata beneath the callee read backward and competed with the callee's responsibility. The renderer therefore hides edge metadata for now and shows only node identity, definition source, and node narration. Future dogfooding can establish whether exceptional edge context needs another treatment.

### Use The Artifact Navigation Shell

Multiple focused roots can make the page long enough to require navigation. Root navigation adapts the established `ho-artifacts` pattern into one fixed `<details>` at the header's top-right, with an opaque summary trigger, an absolutely positioned root menu, stable fragment IDs, self-linking root headings, and fragment offsets. This keeps navigation available without reserving page width or adding JavaScript.

### Allow Optional Permanent Source Links

Definition sources are useful jump points when sharing or reviewing the generated page outside an editor. The renderer accepts an optional GitHub blob URL pinned to a full commit SHA and links repository-relative `path:line` sources. Keeping the repository context in a renderer option avoids expanding the graph schema, while requiring the caller to supply the permanent base avoids guessing the repository or generating mutable branch links.

### Package Before Dogfooding

The workflow was packaged as `ho-call-chain` before the first fresh trial because the point of dogfooding is to test whether fixed skill instructions remove conversational nudging. A manual trial using instructions copied from a note would not test the reusable workflow.

The first skill deliberately uses one inline collector. It does not automatically delegate roots to subagents or invoke CallDiff.

## Current Responsibility Split

### Agent Collector

- Locate the requested behavior or entrypoints.
- Follow calls across files.
- Preserve useful wrappers and fan-out.
- Select roots and practical stopping boundaries.
- Record definition and call-site sources.
- Add concise node and call narration.
- Add synthetic or unresolved boundaries where literal calls do not express the review flow.
- Write the structured JSON data as `call-chain-<title>.json`.

### Deterministic Renderer

- Traverse each declared root.
- Render a separate section per root.
- Stop at recursion and separate-root references.
- Distinguish node identity and node responsibility.
- Display node definition sources as static text while leaving edge metadata in the data.
- Write self-contained HTML as `call-chain-<title>.html`.

### VS Code Call Hierarchy

- Provide interactive source probing.
- Expand uncertain incoming and outgoing relationships.
- Jump to definitions and call sites during human review.

### Human Reviewer

- Use the HTML as a stable mental map.
- Use VS Code for deeper source exploration.
- Identify missing, noisy, incorrect, or badly chunked areas that should inform the next skill revision.

## Settled Defaults

- Explicit invocation only through `ho-call-chain`.
- Output lives in the relevant `ho-dev-notes` topic.
- Output filenames use matching `call-chain-<title>.json` and `call-chain-<title>.html` stems.
- JSON is the intermediate format.
- Static self-contained HTML is the primary render.
- Multiple roots use the canonical `ho-artifacts` dropdown navigation.
- Sources are visible as plain text by default, with optional GitHub links pinned to a full commit SHA.
- One inline collector is the initial execution model.
- No CallDiff integration by default.
- No strong graph validation or symbol-resolution machinery.
- Synthetic node IDs use square brackets, such as `[worker RPC boundary]`.
- No manual editing of generated HTML.
- No speculative renderer redesign after the accepted baseline.

## Deferred Alternatives

These ideas are not rejected permanently, but they require concrete dogfood evidence:

- Multiple subagents expanding separate roots.
- CallDiff as an automated baseline before agent correction and narration.
- Path-prefix compression in the renderer.
- Different treatment for independent roots versus split subtree roots.
- Stable aligned source columns versus adjacent source labels.
- Additional metadata fields.
- Dedicated synthetic-node metadata or visual treatment beyond the bracketed ID convention.
- YAML for easier hand editing.
- Interactive HTML features.
- Call-flow diff rendering.

## Dogfood Questions

The next iteration should be based on a fresh real review. Observe:

- Did the skill find useful roots from a thin request?
- Did it preserve enough intermediate calls without flooding the view with utility detail?
- Were stopping boundaries sensible?
- Did node notes describe responsibility while call notes describe invocation context?
- Did one collector handle the breadth, or did separate roots need independent agents?
- Were missing dynamic edges materially harmful?
- Did full source paths become too noisy in real usage?
- Did root splitting help the overview?
- Could the human use exact IDs to continue probing in VS Code?
- How much follow-up nudging was still required?

Revise the skill from these observations. Prefer the smallest change that addresses repeated real friction.
