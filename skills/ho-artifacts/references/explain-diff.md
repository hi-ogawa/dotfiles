# Explain Diff Artifacts

Reference for teaching or auditing a code change as a self-contained HTML artifact. Read this for a diff, branch, commit series, or PR. Inherit the base skill's visual taste, navigation, location, provenance, and publishing workflow.

## Purpose

Organize a change by concept rather than file order so the reader can understand how behavior, state, and implementation fit together. The artifact should help the reader participate in the next development loop, not merely paraphrase the diff.

This format can serve three different reader positions:

- **Catch-up:** The implementation ran ahead of the reader. Teach enough background and intuition to rebuild the missing mental model.
- **Participant:** The reader already shaped the design. Keep prior context brief and focus on how concepts became code, where the implementation refined the design, and which details deserve direct inspection.
- **Onboarding:** The reader did not participate but needs a durable explanation of the final system rather than the development history.

Infer the position from the conversation and linked context. Do not recreate an architecture issue or exploration in prettier HTML when the reader already owns that model.

## Investigation

Before writing:

1. Identify the exact base and head revisions and inspect the complete diff.
2. Explore surrounding callers, state, runtime boundaries, persistence, tests, configuration, and documentation far enough to explain behavior rather than edits alone.
3. Read linked issues, design notes, explorations, and relevant commit history. Treat them as context and learning history, not a specification the final code must mechanically mirror.
4. Determine the smallest useful mental model, the observable change, and the implementation details most likely to be lost in a high-level summary.
5. Separate facts supported by the inspected code from interpretation, rationale, and unresolved questions.

Prefer checked-in behavior and tests over a PR description when they disagree. Preserve the distinction between the intended design and the implementation that actually landed.

## Narrative

Build a concept-linearized walkthrough before writing HTML:

1. **Opening invariant:** State the change's core idea and observable consequence in one or two sentences.
2. **Background:** Explain only the existing system needed for this change. Go deep in catch-up or onboarding mode; compress or link existing context in participant mode.
3. **Intuition:** Use a concrete toy input, before/after case, or small interactive model before implementation detail. Reuse a small set of visual encodings throughout.
4. **Code:** Group changes by causal concept, execution flow, or dependency order. Do not walk files alphabetically.
5. **Edges:** Surface important contracts, failure cases, deliberate omissions, test gaps, or places where direct diff reading still matters.
6. **Understanding check:** Add a quiz or focused review prompts when they help the reader test the model rather than recall wording.

These are reasoning stages, not mandatory top-level headings. Scale the structure to the change and reader position.

## Connect Concepts To The Diff

High-level explanation and raw evidence should reinforce each other:

- Put the relevant files and pinned line links beside each concept.
- Include selected raw diff hunks when exact control flow, ownership, error handling, or boundary behavior matters.
- Use collapsible `<details>` for longer hunks so the conceptual walkthrough remains skimmable.
- Render code as `<pre><code>` and explicitly preserve whitespace with `white-space: pre` or `pre-wrap`.
- Explain what each hunk realizes, refines, or leaves unverified.
- Link the complete PR diff instead of reproducing it in full.

Do not smooth awkward implementation details into an artificially inevitable story. A coherent explanation can accidentally hide the friction that would make a reviewer question the code.

## Quiz And Review Prompts

Use a quiz as a comprehension gate when the reader needs to catch up or onboard. Five medium-difficulty questions are a useful default for a substantial change, but do not force a quiz onto a participant-mode implementation audit.

Ask about causality, invariants, contracts, edge cases, and trade-offs. Avoid trivia, copied phrases, implausible distractors, or answer patterns that reveal the correct option. Native `<details>` answers keep the artifact static; use small dependency-free inline JavaScript only when immediate multiple-choice feedback materially improves the exercise, and keep all content readable without it.

For participant mode, focused prompts can be more useful than a quiz, for example:

- Which exact code owns the invariant described above?
- What happens when this operation fails halfway through?
- Which behavior is covered only indirectly by tests?
- Where did the final implementation simplify or revise the earlier design?

## Avoid

- Rewriting an existing design document without adding implementation understanding
- Presenting the PR description as proof of runtime behavior
- Walking changed files in repository order
- Dumping the complete diff into the page
- Teaching only the happy path
- Treating exploratory architecture as a fixed contract
- Narratively laundering surprising or fragile code
- Using a quiz to certify understanding of the prose rather than the system

## Inspiration

- Geoffrey Litt, [Understanding is the new bottleneck](https://www.geoffreylitt.com/2026/07/02/understanding-is-the-new-bottleneck)
- Geoffrey Litt, [`explain-diff-html`](https://gist.github.com/geoffreylitt/a29df1b5f9865506e8952488eac3d524)
