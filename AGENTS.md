At the start of every session in this repository, read the repository-root `README.md` before responding or taking action.

Before running `./sync.sh apply`, run `./sync.sh diff` with the exact same file filter and inspect the destination changes. Never broaden a file-specific sync request to its parent group.

When the user asks to catch up, or just to pull, treat it as catching up on changes made from another machine, and do all of the following without waiting to be asked for each step:

1. Pull with `git pull --ff-only`.
2. Summarize the new commits by what changes for the user rather than by file, and mention any new remote branch with unmerged commits. Skill changes need no sync, because skills are symlinked.
3. Run `./sync.sh status`, read the full diff of each file that differs without truncating it, and sort its differences into system-only and repo-only lines. Suggest save, apply, or a manual edit for each file, and don't save machine-specific state such as local proxies, project trust entries, or sections the app manages itself.

Don't run `./sync.sh apply` or `./sync.sh save` until the user picks a file.
