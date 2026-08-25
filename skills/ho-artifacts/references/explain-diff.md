# Explain Diff Artifacts

Reference for explaining a code change, diff, branch, commit series, or PR as a self-contained HTML artifact. Inherit the base skill's visual taste, navigation, location, provenance, and publishing workflow.

## Default

Produce a concept-linearized walkthrough:

1. Briefly establish the existing system relevant to the change.
2. Explain the change's core intuition with a concrete example before implementation detail.
3. Walk through the code in causal or dependency order rather than file order.
4. Connect each concept to pinned code links and selected raw diff hunks when exact details matter.
5. End with five medium-difficulty quiz questions about behavior and causality rather than trivia.

Inspect the complete diff and enough surrounding code to explain behavior accurately. Read linked issues, design notes, and explorations for context, but do not repeat material the reader already supplied or treat prior exploration as a specification.

## Deep Explanation

When the user asks to deeply understand or onboard to an unfamiliar change, expand the background, toy examples, and diagrams.

## Inspiration

- Geoffrey Litt, [Understanding is the new bottleneck](https://www.geoffreylitt.com/2026/07/02/understanding-is-the-new-bottleneck)
- Geoffrey Litt, [`explain-diff-html`](https://gist.github.com/geoffreylitt/a29df1b5f9865506e8952488eac3d524)
