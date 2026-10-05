# tmux Configuration

`.tmux.conf` enables mouse support, including wheel scrolling through pane history. Applications that request mouse events can handle their own scrolling.

`prefix O` opens the most recently copied text, so it works right after a mouse drag-selection. In copy-mode, `o` copies the current selection and opens it. URLs open with `xdg-open`, and anything else opens in VS Code with `code -g`, which accepts a file, `file:line:col`, or a directory. Relative paths resolve against the pane's current directory.

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
