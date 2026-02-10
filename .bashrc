#!/bin/bash

# prompt
PS1='\w \$ '

# exports
export EDITOR="nano"
export PATH="$HOME/.local/bin:$PATH"
export PATH="$HOME/.cargo/bin:$PATH"

# pnpm
export PNPM_HOME="$HOME/.local/share/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac

# opencode
export PATH="$HOME/.opencode/bin:$PATH"

# https://docs.brew.sh/Homebrew-on-Linux
test -d /home/linuxbrew/.linuxbrew && eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv bash)"

# https://yazi-rs.github.io/docs/quick-start#shell-wrapper
y() {
  local tmp="$(mktemp -t "yazi-cwd.XXXXXX")"
  yazi "$@" --cwd-file="$tmp"
  if cwd="$(cat -- "$tmp")" && [ -n "$cwd" ] && [ "$cwd" != "$PWD" ]; then
    cd -- "$cwd"
  fi
  rm -f -- "$tmp"
}

ho_english() {
  if [ "$#" = "0" ]; then
    export LC_ALL=en_US.UTF-8
  else
    LC_ALL=en_US.UTF-8 eval "${@}"
  fi
}

ho_swap_reset() {
  sudo swapoff -a && sudo swapon -a
}

# pnpm completion for package.json scripts
# - completes `pnpm <script>` and `pnpm -C <dir> <script>`
# - uses jq to parse package.json (faster than official pnpm completion)
ho_setup_pnpm_completion() {
  # skip if jq is not installed
  type jq &>/dev/null || return

  _ho_pnpm_completion() {
    local words cword
    # use _get_comp_words_by_ref to handle colons in script names (e.g. "dev:watch")
    # since bash treats ":" as a word separator by default
    if type _get_comp_words_by_ref &>/dev/null; then
      _get_comp_words_by_ref -n : -w words -i cword
    else
      cword="$COMP_CWORD"
      words=("${COMP_WORDS[@]}")
    fi

    local cur="${words[cword]}"
    local package_json_path

    # handle `pnpm -C <dir> <script>`
    if [ "${words[1]}" = "-C" ]; then
      if [ "$cword" = "2" ]; then
        # complete directory for -C argument
        # shellcheck disable=SC2207
        COMPREPLY=($(compgen -d -S / -- "$cur"))
        return
      fi
      if [ "$cword" = "3" ]; then
        package_json_path="${words[2]}/package.json"
      fi
    else
      # handle `pnpm <script>`
      if [ "$cword" = "1" ]; then
        package_json_path="package.json"
      fi
    fi

    if ! [ -f "$package_json_path" ]; then
      return
    fi

    # shellcheck disable=SC2207
    COMPREPLY=($(jq -r --arg prefix "$cur" '.scripts | keys | .[] | select(startswith($prefix))' "$package_json_path"))

    # fix display for colon-prefixed completions (companion to _get_comp_words_by_ref -n :)
    if type __ltrim_colon_completions &>/dev/null; then
      __ltrim_colon_completions "$cur"
    fi
  }

  complete -o nospace -o default -F _ho_pnpm_completion pnpm
}

ho_setup_pnpm_completion

# bun
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# fnm
FNM_PATH="$HOME/.local/share/fnm"
if [ -d "$FNM_PATH" ]; then
  export PATH="$FNM_PATH:$PATH"
  eval "`fnm env`"
fi
