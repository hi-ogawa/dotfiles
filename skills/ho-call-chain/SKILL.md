---
name: ho-call-chain
description: >-
  Build an agent-curated, narrated, multi-file call-chain overview as structured JSON and static HTML for local code review. Use only when the user explicitly invokes "ho-call-chain".
---

# Call Chain

## Maintenance Note

When maintaining or redesigning this skill, read `references/design-rationale.md` first. Do not read it during ordinary call-chain collection.

## Purpose

Produce a large, concrete call-tree overview that helps a human bootstrap code review through selected roots, meaningful fan-out, conceptual edges, source locations, and compact narration. The result is a rough local review aid, not a complete or formally validated static call graph.

## Input

Accept a behavior to trace, one or more entrypoint symbols, or an existing investigation topic. Infer practical boundaries from the request and codebase. Ask one short question only when the requested behavior or starting point is too ambiguous to locate.

Do not invoke this workflow for ordinary code explanation. The user must explicitly invoke `ho-call-chain`.

## Output Location

Read and follow the `ho-dev-notes` skill for the output location.

Write:

```text
<topic-dir>/call-chain-<title>.json
<topic-dir>/call-chain-<title>.html
```

## Collection

Follow the requested behavior across files and optimize for a useful large overview rather than certainty or completeness. Preserve intermediate wrappers, meaningful fan-out, and procedure order. Use exact, human-readable symbol names as IDs, qualifying them only when necessary to avoid ambiguity.

Use synthetic nodes for useful conceptual transitions such as RPC, worker, callback, or framework boundaries. Wrap every synthetic node ID in square brackets, such as `[worker RPC boundary]`. Leave unresolved dynamic dispatch as a named synthetic leaf. Stop at third-party internals, low-value utility detail, an explicit scope boundary, or the point where deeper expansion no longer helps review. Use multiple roots for independent entrypoints or to split an important deep subtree into its own section.

## Data Shape

Use JSON. The graph fields are deliberately minimal:

```json
{
  "roots": ["handleRequest", "renderPage"],
  "nodes": [
    {
      "id": "handleRequest",
      "source": "src/server.ts:42",
      "note": "Routes an incoming request.",
      "calls": [
        {
          "to": "matchRoute",
          "source": "src/server.ts:51",
          "note": "Resolves route ownership before dispatch."
        },
        {
          "to": "renderPage",
          "source": "src/server.ts:63",
          "note": "Runs only for matched page routes."
        }
      ]
    },
    {
      "id": "matchRoute",
      "source": "src/router.ts:18",
      "note": "Matches the normalized pathname."
    },
    {
      "id": "renderPage",
      "source": "src/render.ts:27",
      "note": "Produces the page response."
    }
  ]
}
```

A node's `source` is its definition, while a call's `source` is the invocation site. A node's `note` describes its responsibility in this flow, while a call's `note` describes invocation context or transition. Keep notes to one concise sentence.

`source`, `note`, and `calls` may be omitted when they do not apply, especially for synthetic or leaf nodes. Missing `calls` means an empty array. Every node must have `id`. Every call must have `to`, and every target should have a corresponding node record.

See `references/sample.json` for root splitting, a synthetic boundary, and recursion.

## Rendering

Resolve `scripts/render.mjs` relative to this skill directory, then run:

```sh
node <skill-dir>/scripts/render.mjs <topic-dir>/call-chain-<title>.json <topic-dir>/call-chain-<title>.html
```

## Completion

Run the renderer and use successful generation as verification. Correct the JSON data and rerun when validation fails.

Return both absolute paths and a brief summary containing the roots, node count, and any intentionally unresolved boundaries.
