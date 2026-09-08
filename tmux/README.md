# tmux Configuration

`.tmux.conf` enables mouse support, including wheel scrolling through pane history. Applications that request mouse events can handle their own scrolling.

Install from the repository root after inspecting the destination diff:

```sh
./sync.sh diff tmux/.tmux.conf
./sync.sh apply tmux/.tmux.conf
```

New tmux servers load `~/.tmux.conf` automatically. Reload it in an existing server with:

```sh
tmux source-file ~/.tmux.conf
```

See the [Codex scrolling notes](../codex/opencode-to-codex.md#terminal-wheel-scrolling) for the OpenCode comparison and interactive controls.
