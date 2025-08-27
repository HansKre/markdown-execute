# makrdown-execute

VSCode Extension which allows you to execute code from `markdown` files.
Find it on the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=hanskre.markdown-execute).

- Detects code blocks in your `markdown`-files starting with:

  - \`\`\`sh
  - \`\`\`bash
  - \`\`\`js
  - \`\`\`python

- Adds `'Execute command in terminal as Shell-Script'`, `'Execute command in terminal as NodeJs-Script'`, `'Execute command in terminal as python-Script'` label.
- Clicking on the label executes code-block until the closing ticks \`\`\` in the terminal as `Shell`, `NodeJs` or `Python` script.

Alternatively, use `cmd+f1` (mac) / `ctrl+f1` (windows) shortcut to execute current selection.

## Features

### Execute code blocks in terminal

![demo-execute](images/demo-execute.gif)

### Execute Selection

Select code and either use shortcut `cmd+f1` (mac) / `ctrl+f1` (windows) to execute or open the VSCode `command palette` and type `markdown execute` to find the command:

![demo-shortcut](images/demo-shortcut.gif)

### Side By Side view

If you interact with terminal very often, I recomment using the terminal in editor area side by side in split view.:

![side-by-side-view](images/side-by-side.png)

## Extension Settings

This extension contributes the following settings:

- `markdown-execute.executeInSsh`: enable/disable execution of code in a SSH session. If disabled and active terminal is running a SSH session, a new terminal is used as target for commands.
- `markdown-execute.executeSelection`: Shortcut to execute selection. Defaults to `cmd+f1` (mac) / `ctrl+f1` (windows).

## Backlog

1. Analyse and fix why the watch-task in debugging terminal is ignored
2. Add PHP & TypeScript as execution runtimes:
   1. `commandCodeLensProvider`:
      1. Execute command with TS
      2. Execute command PHP
   2. `extension.ts` & `execute.ts`:
      1. Add PHP and TS as execution runtimes
3. Add quick select keybinding without promting:
   1. `cmd+f1 s` Execute command as Shell
   2. `cmd+f1 s` Execute command with Nodejs

## Appreciations

[Sycl´s Markdown Command Runner](https://marketplace.visualstudio.com/items?itemName=Sycl.markdown-command-runner) Extension served as inspiration. Thanks!

It was lacking execution of code blocks in active SSH sessions, shortcuts and `NodeJs`-support, so I made my own.

## Contributors

- [@roman-drozd-it](https://github.com/roman-drozd-it)
