# Shell Configuration

- `.bashrc` is the Linux/WSL Bash setup.
- `.zshrc` is the macOS-oriented Zsh setup.

## Zsh Completions

`.zshrc` uses `compinit -C` for faster startup. This skips automatic validation of the completion dump. After installing or removing zsh completions, run plain `compinit` to rebuild:

```sh
autoload -Uz compinit
compinit
```
