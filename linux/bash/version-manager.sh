#!/bin/bash

# https://github.com/pyenv/pyenv
ho_setup_pyenv() {
  export PYENV_ROOT="$HOME/.pyenv"
  export PATH="${PYENV_ROOT}/bin:$PATH"
  eval "$(pyenv init --path)"
}

# https://docs.python.org/3/library/venv.html
ho_setup_venv() {
  local venv_dir="${1:-.venv}"

  if test ! -d "$venv_dir"; then
    echo -n ":: Virtualenv (${venv_dir}) doesn't exist. Proceed to create it? [y/n] "
    read -e -r -n 1
    case "$REPLY" in
    '') echo "" ;;
    y) ;;
    *)
      echo ":: Canceled"
      return 1
      ;;
    esac

    echo ":: Creating virtualenv at ${venv_dir} ..."
    if ! python -m venv "$venv_dir"; then
      echo ":: Creating virtualenv failed"
      return 1
    fi
  fi

  source "${venv_dir}/bin/activate"
}

# https://github.com/nvm-sh/nvm
ho_setup_nvm() {
  NVM_DIR="$(readlink -f "${HOME}/.nvm")"
  export NVM_DIR
  . "$NVM_DIR/nvm.sh"
}

# https://volta.sh/
# usage with corepack (cf. https://github.com/volta-cli/volta/issues/987#issuecomment-914502143)
#   volta install corepack
#   corepack enable --install-directory ~/.volta/bin
ho_setup_volta() {
  export VOLTA_HOME="$HOME/.volta"
  export PATH="$VOLTA_HOME/bin:$PATH"
}

# https://asdf-vm.com/guide/getting-started.html#_3-install-asdf
ho_setup_asdf() {
  if [[ -f /opt/asdf-vm/asdf.sh ]]; then
    . /opt/asdf-vm/asdf.sh
  fi
}
