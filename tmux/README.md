# tmux Configuration

`.tmux.conf` enables mouse support, including wheel scrolling through pane history. Applications that request mouse events can handle their own scrolling.

Closing a window renumbers the remaining ones, so indices stay contiguous instead of accumulating gaps. The renumbering applies across a session group, which keeps every wtmux view of a workspace in sync.

`prefix O` (the prefix key, then Shift+O) opens the most recently copied text, so it works right after a mouse drag-selection. In copy-mode, `o` copies the current selection and opens it. URLs open with `xdg-open`, or `open` on macOS, and anything else opens in VS Code with `code -g`, which accepts a file, `file:line:col`, or a directory. Relative paths resolve against the pane's current directory, and a leading `~` expands to your home directory.

OSC 8 hyperlinks pass through to the outer terminal. tmux detects link support in terminals it recognizes, such as Ghostty, and the config adds it for `xterm-256color` so links also reach VS Code's terminal. Mouse mode keeps clicks from the outer terminal, so hold Shift as well, for example Ctrl+Shift+click in Ghostty.

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
