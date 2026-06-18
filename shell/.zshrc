# Homebrew
# Load first so later PATH entries prepend after brew and take precedence
# over brew-installed tools on name collisions.
if [ -x /opt/homebrew/bin/brew ]; then
  eval "$(/opt/homebrew/bin/brew shellenv)"
elif [ -x /home/linuxbrew/.linuxbrew/bin/brew ]; then
  eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
fi

# prompt
PROMPT='%~ $ '

# history (append across sessions; don't rely on /etc/zshrc defaults)
HISTFILE="$HOME/.zsh_history"
HISTSIZE=10000
SAVEHIST=10000
setopt APPEND_HISTORY

# exports
export EDITOR="nano"
export PATH="$HOME/.local/bin:$PATH"
export PATH="$HOME/.cargo/bin:$PATH"

# pnpm v11 uses `$PNPM_HOME/bin`; keep `$PNPM_HOME` for older installs during migration.
export PNPM_HOME="$HOME/.local/share/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME/bin:"*) ;;
  *) export PATH="$PNPM_HOME/bin:$PATH" ;;
esac
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac

# opencode
export PATH="$HOME/.opencode/bin:$PATH"

opencode-yolo() {
  OPENCODE_PERMISSION='{"*":"allow"}' opencode "$@"
}

ho_english() {
  if [ "$#" = "0" ]; then
    export LC_ALL=en_US.UTF-8
  else
    LC_ALL=en_US.UTF-8 eval "${@}"
  fi
}

# completion
autoload -Uz compinit
compinit -C

# pnpm completion for package.json scripts
# - completes `pnpm <script>` and `pnpm -C <dir> <script>`
# - uses jq to parse package.json (faster than official pnpm completion)

_ho_pnpm_scripts() {
  local package_json="$1"
  local -a scripts

  [[ -f "$package_json" ]] || return 1
  scripts=("${(@f)$(jq -r '.scripts | keys[]?' "$package_json" 2>/dev/null)}")
  (( ${#scripts[@]} )) || return 1

  compadd -Q -- "${scripts[@]}"
}

_ho_pnpm_completion() {
  if ! command -v jq >/dev/null 2>&1; then
    return 1
  fi

  if [[ "${words[2]}" == "-C" ]]; then
    if (( CURRENT == 3 )); then
      _files -/
      return
    fi

    if (( CURRENT == 4 )); then
      _ho_pnpm_scripts "${words[3]}/package.json"
      return
    fi
  else
    if (( CURRENT == 2 )); then
      _ho_pnpm_scripts "package.json"
      return
    fi
  fi

  return 1
}

compdef _ho_pnpm_completion pnpm

# bun
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# https://viteplus.dev
if [ -d "$HOME/.vite-plus" ]; then
  . "$HOME/.vite-plus/env"
fi
