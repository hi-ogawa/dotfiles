---
name: ho-writing
description: >-
  Write prose in the user's style. Use when writing or editing prose that lives outside the conversation, such as documents, code comments, commit messages, PR descriptions, issue comments, and agent instructions, or when the user invokes "ho-writing".
---

# Writing

When the user invokes this skill in a conversation, apply it to your replies as well for the rest of the conversation.

## Prose

Write naturally for a first-time reader, without the awkward or defensive tone that builds up when text is revised alongside code changes. Describe what is, not what changed or what it no longer does.

Write plain, simple English that readers at any level of English can follow, including non-native readers. Prefer short sentences, common words, and one idea per sentence over sophisticated phrasing, even when the result feels boring.

Do not hard-wrap prose paragraphs in Markdown.

Prefer explicit connective words over symbol-based connectives (`—`, `;`, `:`) when expressing a logical relation between clauses, such as cause, contrast, consequence, or elaboration. Name the relation in words (for example `because`, `so`, `but`, `which means`, `for example`) so the sentence structure survives being read aloud. The same applies to a bare comma whose second phrase could be read as a restatement, an example, or a new fact, such as a definition or a value, so write `which is`, `meaning`, or `as in` rather than leaving the reader to infer the relation. A formula that restates the words right before it can stay after a bare comma, since it cannot be mistaken for a new fact. This targets logical connectives only, so keep punctuation for genuinely structural uses such as a colon before a list.

## Revision

Text that accompanies work in progress, such as a PR description, an issue plan, or a design doc, costs an update on every change. While the work is iterating, update it only when the motivation, scope, or behavior a reader sees changes, and leave smaller drift for one pass at finalization, such as marking a PR ready for review or merging it. At that pass, reread it as a first-time reader and rewrite whatever no longer matches. If a change that leaves all three alone still makes the text inaccurate, the text describes internal details. Remove them rather than keep updating them, because the diff already shows them and they keep changing while the work iterates.

When a sentence you wrote is flagged during revision, first decide what the reader needs from it at that point in the section, then rewrite it for that purpose. Patching only the flagged words keeps a sentence that may not be doing its job.

When the user asks to fix the English in text they wrote, fix only errors such as grammar, word choice, and tense, and keep their wording and sentence structure, because the text is in their voice. This holds however the request is phrased, such as "fix English issues" or "fix English bugs". If a sentence still reads unclearly, suggest a rewrite instead of applying it.

## Code Comments

Comment only what the code cannot say, such as a non-obvious reason or a constraint the types do not show. Do not restate a name or type, do not describe other files, and state a rationale once, where it is enforced.

## Docs

Write each doc for the question its reader brings. An explanation answers how something works and why, so a reader can follow it without the code open, and it does not inventory components, function names, or file lists, which the code already shows and which churn with every refactor. A reference answers what exists and what each thing is for. A guide answers what to do, including what to run when a command rejects something.

## Instructions

When writing instructions, state defaults directly. Avoid redundant exception clauses such as `unless explicitly requested` when an instruction already establishes a default. Keep explicit exceptions when they define safety or permission boundaries.
