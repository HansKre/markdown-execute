# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a VSCode extension that allows users to execute code blocks directly from markdown files. It supports Shell, NodeJS, and Python runtimes. The extension provides two ways to execute code:
1. **CodeLens annotations** - clickable labels above code blocks
2. **Keyboard shortcut** (`cmd+f1` / `ctrl+f1`) - execute selection or current code block

## Development Commands

### Setup
```sh
npm install
```

### Development
- Press `F5` in VS Code to start debugging
  - Compiles and runs the extension in a new **Extension Development Host** window
  - A watch task runs automatically to recompile on changes
- Manually compile: `npm run compile`
- Watch mode: `npm run watch`

### Code Quality
- Lint: `npm run lint`
- Package for production: `npm run package`

### Publishing
See DEVELOPMENT.md for detailed publishing instructions. Quick reference:
```sh
vsce publish patch  # auto-increments version, creates git tag/commit, publishes
```

## Architecture

### Entry Point
- **extension.ts**: Main activation point. Registers two commands:
  1. `markdown-execute.execute` - executed when CodeLens is clicked
  2. `markdown-execute.executeSelection` - executed via keyboard shortcut

### Core Components

**CommandCodeLensProvider** (commandCodeLensProvider.ts):
- Parses markdown documents to find code blocks
- Detects runtime from fence markers (```sh, ```bash, ```js, ```python)
- Creates clickable CodeLens annotations above code blocks
- Ignores lines starting with `//`

**executeAt** (executeAt.ts):
- Routes execution based on runtime type
- For Shell: executes directly
- For NodeJS: wraps in `node -e "..."`
- For Python: checks for python/python3 availability, wraps in `python -c "..."`
- Handles shell escaping for special characters: `"`, `` ` ``, `$`, `\`

**execute** (execute.ts):
- Manages terminal instances and tracks last used terminal
- Finds or creates available terminals (checks for closed/busy terminals)
- Sends commands to terminal with platform-specific adjustments:
  - PowerShell: replaces backslashes with backticks
  - CMD: removes backslashes and line breaks
- Prevents SSH execution based on user configuration

**Runtime Detection** (types/types.ts):
- Recognizes: ````sh`, ````bash`, ````js`, ````python`
- Returns Runtime enum: Shell, NodeJs, Python

### Selection Logic (executeSelection command)

When no text is selected, the extension intelligently determines what to execute:
- **Case 1**: Cursor on opening fence (```js) → selects everything until closing ```
- **Case 2**: Cursor on closing fence (```) → selects everything back to opening fence
- **Case 3**: Cursor inside code block → executes single line, searches upward for runtime

### Configuration

Available settings (markdown-execute.*):
- `executeInSsh`: Allow/prevent execution in SSH terminals (default: true)
- `confirmation`: Confirmation mode before execution - "none", "pick", "message", "modal" (default: "pick")

### Build System

Uses webpack to bundle TypeScript → `dist/extension.js`:
- Entry: `src/extension.ts`
- Target: Node.js (VSCode extension host)
- Source maps: nosources-source-map
- Production mode for publishing

### Testing

Manual testing workflow (see DEVELOPMENT.md):
1. Press `F5` to start Extension Development Host
2. Create terminal instances
3. Test code execution from markdown files
4. Debug output goes to DEBUG CONSOLE in parent VSCode instance
