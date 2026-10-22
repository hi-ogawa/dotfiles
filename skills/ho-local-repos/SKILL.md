---
name: ho-local-repos
description: >-
  Use ~/code/ as a local repository library. Use only when the user explicitly writes "ho-local-repos" or "ho-repos".
---

# Local Repositories

Use repositories under `~/code/` as local context for the task.

## Scope

- `~/code/others/` contains cloned external and open-source repositories. Check here first for external projects.
- `~/code/personal/` contains the user's projects. Use it when the request concerns prior personal work or a personal repository.

Infer from the request whether a repository is reference material or the work target. Inspect it without changes when using it as a reference, and follow the normal editing workflow when the user wants work done there.

## Cloning

Prefer an existing clone. If the repository is unavailable, ask before cloning. Use `git clone --depth=1` by default, and clone full history with a plain `git clone` when the task requires it, such as `git log -S` or blame across history. Avoid partial clones such as `--filter=blob:none`, because history searches then fetch file contents one by one over the network.
