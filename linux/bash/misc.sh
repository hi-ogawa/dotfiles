#!/bin/bash

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

ho_notify() {
  # Usage:
  # $ ninja -C build; ho_notify "'ninja build' finished with status ${?}"
  notify-send -a 'ho_notify' "${*:-ho_notify}"
}

ho_whose() {
  # Usage:
  # $ ho_whose yay
  # /usr/bin/yay is owned by yay-bin 11.0.2-1
  result="$(type -P "$1")" && pacman -Qo "$result"
}

ho_ytdl_audio() {
  local dst_dir="$HOME/Music/__tmp__"
  local options=(
    --extract-audio
    --add-metadata
    --output "${dst_dir}/%(channel)s/%(title)s --- %(id)s.%(ext)s"
  )
  for url in "$@"; do
    youtube-dl "${options[@]}" "$url"
  done
}

ho_npm_completion() {
  # shellcheck disable=SC1090
  source <(npm completion)
}

# simple pnpm command completion for package.json scripts
ho_setup_pnpm_completion() {
  _ho_pnpm_completion() {
    # workaround bash's default word breaks for colon ":"
    #   https://github.com/pnpm/tabtab/blob/ab9ea7029e19aae955952ddc10d403d70cbbbcb7/lib/scripts/bash.sh
    #   https://stackoverflow.com/questions/10528695/how-to-reset-comp-wordbreaks-without-affecting-other-completion-script
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
      # handle "pnpm -C ..."
      if [ "$cword" = "2" ]; then
        # shellcheck disable=SC2207
        COMPREPLY=($(compgen -d -S / -- "$cur"))
        return
      fi

      # handle "pnpm -C some-dir ..."
      if [ "$cword" = "3" ]; then
        package_json_path="${words[2]}/package.json"
      fi
    else

      # handle "pnpm ..."
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

# https://docs.deno.com/runtime/manual/getting_started/installation
ho_setup_deno() {
  export DENO_INSTALL="$HOME/.deno"
  export PATH="$DENO_INSTALL/bin:$PATH"
}

# https://emscripten.org/docs/getting_started/downloads.html
# https://aur.archlinux.org/packages/emsdk
ho_setup_emsdk() {
  source emsdk_env.sh
}
