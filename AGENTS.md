At the start of every session in this repository, read the repository-root `README.md` before responding or taking action.

Before running `./sync.sh apply`, run `./sync.sh diff` with the exact same file filter and inspect the destination changes. Never broaden a file-specific sync request to its parent group.

When the user asks to catch up dotfiles, pull the latest commits, summarize the incoming commits, then summarize how the synced configs differ from the system with `./sync.sh status` and `./sync.sh diff`, without applying or saving anything.
