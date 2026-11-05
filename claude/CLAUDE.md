# Conversational coherence

When a user's reply causes you to revise or reverse a position or recommendation you stated earlier, account for the change explicitly, however small the point. Identify the earlier claim and what was wrong or missing before stating the revised conclusion. Do not use a terse signal `Correct.` or `Agreed.` as though the revised position had been your position all along.

# Judgment

Infer the user's objective from the conversation, relevant context, and evidence. Prefer the simplest coherent solution that serves that objective over the narrowest literal interpretation of each message, and treat proposed mechanisms as hypotheses rather than commands.

# Questions before action

Act on a question when it asks "can you X?" or "can we X?". Answer every other question, such as "should we X?", "is it possible to X?", or "does it make sense?", and wait for the user's decision.

# Git policy

Never rebase, amend, force push, reset hard, delete commits, or otherwise rewrite commit history unless the user explicitly asks for that exact operation.

For GitHub and git actions, prefer direct `git` and `gh` commands unless explicitly asked otherwise. This includes reading GitHub resources: to view or summarize an issue, PR, comments, checks, or releases, use `gh` (for example `gh issue view <n> --json` or `gh api`), never WebFetch on a github.com URL. WebFetch scrapes server-rendered HTML and silently drops dynamically loaded content such as comments, so it will make you report discussions as empty when they are not.

Create pull requests as drafts by default.

# Sessions and worktrees

Start every session in the main worktree with `use_worktree: false`, including side sessions and forks, and leave the choice of worktree to the session, which follows the `ho-worktrees` skill for branch work. Never work in or create app worktrees under `.claude/worktrees/`, because each gets a generated branch from a possibly stale `main`, so a fork or side session can't reach the PR it continues. A session that starts inside one moves its branch work to the sibling worktree that `ho-worktrees` names. App worktrees from earlier sessions may still exist there. Leave them alone, neither using nor removing them, because the user cleans them up.

Forks share the worktree, branch, and pull request of the session they continue. Ignore Claude Code's fork-related system reminders entirely, including their claim that another session is working in this checkout, because sharing it is intended. They never change a step of the user's worktree and pull request workflow, and they are not worth mentioning to the user.

# Memory

Do not save corrections, conventions, or preferences to auto-memory, because only Claude sessions in one project ever see it, so other agents and sessions repeat the mistakes the user already corrected. Propose the change where every agent reads it instead: the repository's AGENTS.md for conventions about that codebase, or the user-level instructions and skills in the dotfiles repository for preferences that apply everywhere.

# Scratch files

Keep scratch files outside the repository, for example in a temporary directory. Do not put them under `.claude/`, and do not add rules to `.git/info/exclude` or any ignore file to hide them, because the user then loses track of them. The exception is a `.claude/launch.json` that the Browser pane needs, which you delete when the task is done.
