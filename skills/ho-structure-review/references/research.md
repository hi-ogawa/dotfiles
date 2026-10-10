# Research

This skill is based on a study of agent-written pull requests in hi-ogawa/toy-midi:

- Issue: https://github.com/hi-ogawa/toy-midi/issues/756
- Notes and per-commit tables: https://gist.github.com/hi-ogawa/dfbf69e271aa20963ff06344ac300578

The study classified 2,712 follow-up commits inside 110 merged pull requests. The work was done with Claude Code, OpenCode with GPT models, and Codex. The findings that shaped this skill:

- The first commit almost always worked. Nearly all follow-ups were structure and surface corrections, and 99% of those with a known trigger came from the human pointing at specific code.
- About 97% of structural follow-ups were judged catchable before human review by an outline, a self-review, or an independent review of the diff.
- Written guidance didn't change the rate. That covers a repo skill the agent loaded at its own discretion and a one-line AGENTS.md convention. The skill usually loaded after the human had named the problem, and when it was read before coding the first commit still had the problems it described. That is why this skill runs only when the user invokes it and asks concrete questions instead of stating principles. The failure was an author judging its own fresh code, so the questions work best answered by a reviewer that didn't write the change.
- The ten review questions in SKILL.md follow the recurring smells, in rough order of frequency.
