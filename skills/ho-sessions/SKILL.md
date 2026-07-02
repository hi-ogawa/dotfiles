---
name: ho-sessions
description: >-
  Search, inspect, and trace past opencode sessions stored in the local opencode database. Use only when the user explicitly invokes "ho-sessions".
---

# Sessions

## Purpose

Find and reconstruct prior opencode work from the local session store. Infer intent rather than dumping everything:

- **Find** — locate the session behind a piece of work and name the single best match.
- **Trace** — assemble a thread across parent/child links and "continue on…" handoffs into a dated timeline.
- **Inspect** — summarize what one session actually did.
- **Survey** — list recent work by directory and date.

The goal of a *find* is the right session, not a session that merely matches a string. Identify the best match and verify it before reporting; if several plausibly fit, present them as a lineage rather than guessing one.

## Search by identity, not by string

Work has many names. A task is reachable through any of its identifiers, and the obvious one is often absent from the session that did the work:

- numbers — a PR number, the issue it closes, related issue numbers
- names — branch, feature slug, file or symbol names, worktree path, dev-notes slug
- phrases — distinctive wording from the request or the plan

Collect the identifiers first (e.g. `gh pr view <n> --json number,title,headRefName,url`, the linked issue, the branch, the worktree/notes slug), then search on all of them and union the results. Searching a single identifier biases toward sessions that happened to mention that exact token.

The worktree path is one such identifier, but search for it in **transcript content**, not the `directory` column — see the caveat under Database. Work done in a worktree usually runs from a session launched in the main repo, often delegated to a subagent whose prompt names the worktree path, so the path appears in the text rather than in `directory`.

Reason about **time** alongside identity. Identifiers are assigned at different moments, so a session created before an identifier existed cannot contain it — implementation predates its PR number, a branch predates its merge, a rename predates the new name. Expect the originating session to be findable only through the identifiers that existed when it ran.

## Verify before trusting a match

A raw text match is a candidate, not an answer:

- **Confirm the reference is real.** Decode the JSON and read the surrounding text. Bare numbers especially collide with unrelated data — an ID like `10667` appears inside epoch-millisecond timestamps such as `1782371066734`. Require a word-boundary match for numeric identifiers and discard digit-flanked hits.
- **Distinguish central from incidental.** A session that implemented the work differs from one that mentioned it in passing (a worktree listing, a status note). Say which is which.
- **Don't trust titles.** Titles are auto-generated from the opening prompt, so they reflect the initial framing, not the final topic or any identifier the session never typed.

## opencode CLI

The built-in CLI is the cheapest first pass and is enough when the target is recent or recognizable by title:

- `opencode session list` — recent sessions as a table (`Session ID`, `Title`, `Updated`).
- `opencode session list --format json -n 100` — machine-readable, for scanning titles/dirs or grabbing the most recent N.
- `opencode export <sessionID>` — dump a session's full transcript as JSON (`--sanitize` redacts sensitive data).

`session list` matches titles only, so it finds work only when the title happens to name it. For anything else, search transcript content in the database below.

## Database

SQLite store, read-only — never mutate it:

```
${XDG_DATA_HOME:-~/.local/share}/opencode/opencode.db
```

Tables and the fields that matter:

- **`session`**: `id, parent_id, slug, directory, title, time_created, time_updated, time_compacting, metadata`. All times are **epoch milliseconds**. `directory` is the cwd opencode was launched in (usually the main repo), **not** the worktree the work happened in — a session working in a worktree still records the main repo here, with the worktree path appearing only in the transcript. Don't filter by `directory` expecting worktree precision; use it only to scope to a project root.
- **`message`**: `id, session_id, time_created, data`. `data` is JSON; `"role"` is `user` / `assistant`.
- **`part`**: `id, message_id, session_id, time_created, data`. `data` is JSON; text content lives in parts where `"type":"text"`, under the `.text` key.

Lineage:

- A subagent / child session has `parent_id` set to its launcher, with a title like `… (@general subagent)` or `… (@explore subagent)`.
- A root session has `parent_id` NULL.
- Cross-session handoffs appear as `continue on <path>` in an opening prompt; follow these to connect split threads.

## Procedure

1. **Collect identifiers** for the target work — numbers, names, phrases, the worktree path — using `gh`, the branch, and any worktree/notes slug. List them before querying.
2. **Survey first** with `opencode session list`; if a recent title gives it away, stop. Otherwise search each identifier (worktree path included) across both `part.data` and `message.data` (`LIKE '%term%'`) and union the session IDs.
3. **Verify each candidate** — decode JSON, confirm the reference is real (word-boundary for numbers), and judge central vs incidental.
4. **Resolve lineage** — pull `title, directory, time_created, time_updated, parent_id`; walk `parent_id` upward, gather children (`parent_id = <id>`), and follow `continue on` handoffs.
5. **Report**, oldest first: the single best match flagged, related sessions as a timeline, and any false positives you filtered so the reasoning is auditable.

## Useful queries

Candidate sessions for one term (verify hits afterward):

```sql
SELECT DISTINCT session_id FROM part    WHERE data LIKE '%<term>%'
UNION
SELECT DISTINCT session_id FROM message WHERE data LIKE '%<term>%';
```

Session metadata + child sessions:

```sql
SELECT id, title, parent_id,
       datetime(time_created/1000,'unixepoch','localtime') AS created,
       datetime(time_updated/1000,'unixepoch','localtime') AS updated,
       datetime(time_compacting/1000,'unixepoch','localtime') AS compacted,
       directory
FROM session WHERE id = '<sid>' OR parent_id = '<sid>'
ORDER BY time_created;
```

First user message: extract `.text` from the earliest `user` message's text parts, decoding the JSON rather than matching raw rows.

## Notes

- Before blaming compaction for an odd title, check `time_compacting` and the absence of `"summary":true` marker messages — titles are usually just auto-generated from the opening prompt.
- Read-only by default. Export a transcript to a file (e.g. into `ho-dev-notes`) only if the user asks, via `opencode export <sessionID>`.
