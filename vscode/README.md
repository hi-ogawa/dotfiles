# VS Code Configuration

This directory contains unified VS Code settings and keybindings designed to provide a consistent experience across Windows and Linux.

## Linux-First Alignment Strategy

As a long-time Linux user, the goal of this configuration is to **make Windows feel like Linux**, ensuring muscle memory remains consistent regardless of the operating system.

## References

- [VSCode settings](https://code.visualstudio.com/docs/getstarted/settings)

## Extensions

Known list of extensions often used locally. Can be exported by `code --list-extensions` or `code-insiders --list-extensions`

```js
$ code-insiders --list-extensions
// anthropic.claude-code
// arcanis.vscode-zipfs
// astro-build.astro-vscode
// bazelbuild.vscode-bazel
bierner.comment-tagged-templates
bierner.markdown-mermaid
// denoland.vscode-deno
// fabiospampinato.vscode-open-in-github
// flowtype.flow-for-vscode
// github.copilot
// github.copilot-chat
github.vscode-pull-request-github
mechatroner.rainbow-csv
// mrmlnc.vscode-json5
// ms-python.debugpy
// ms-python.python
// ms-python.vscode-pylance
// ms-python.vscode-python-envs
ms-vscode-remote.remote-ssh
// ms-vscode-remote.remote-ssh-edit
// ms-vscode.cpptools
// ms-vscode.remote-explorer
// ms-vscode.vscode-js-profile-flame
// oijaz.unicode-latex
// oxc.oxc-vscode
// prisma.prisma
// rust-lang.rust-analyzer
// svelte.svelte-vscode
tamasfe.even-better-toml
// twxs.cmake
// typescriptteam.native-preview
// unifiedjs.vscode-mdx
// vadimcn.vscode-lldb
// vitest.explorer
// vue.volar
```

Install extensions:

```sh
# install one
code --install-extension github.vscode-pull-request-github

# install multiple
xargs -n 1 code --install-extension <<EOF
github.vscode-pull-request-github
tamasfe.even-better-toml
...
EOF
```
