#!/bin/bash

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

# volta (node version manager)
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"

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
ho_setup_pnpm_completion() {
  _ho_pnpm_completion() {
    local words cword
    if type _get_comp_words_by_ref &>/dev/null; then
      _get_comp_words_by_ref -n : -w words -i cword
    else
      cword="$COMP_CWORD"
      words=("${COMP_WORDS[@]}")
    fi

    local cur="${words[cword]}"
    local package_json_path

    if [ "${words[1]}" = "-C" ]; then
      if [ "$cword" = "2" ]; then
        # shellcheck disable=SC2207
        COMPREPLY=($(compgen -d -S / -- "$cur"))
        return
      fi
      if [ "$cword" = "3" ]; then
        package_json_path="${words[2]}/package.json"
      fi
    else
      if [ "$cword" = "1" ]; then
        package_json_path="package.json"
      fi
    fi

    if ! [ -f "$package_json_path" ]; then
      return
    fi

    # shellcheck disable=SC2207
    COMPREPLY=($(jq -r --arg prefix "$cur" '.scripts | keys | .[] | select(startswith($prefix))' "$package_json_path"))

    if type __ltrim_colon_completions &>/dev/null; then
      __ltrim_colon_completions "$cur"
    fi
  }

  complete -o nospace -o default -F _ho_pnpm_completion pnpm
}

ho_setup_pnpm_completion
