# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a VSCode extension that allows users to execute code blocks directly from markdown files. It supports Shell, NodeJS, Python, and TypeScript runtimes. The extension provides two ways to execute code:
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

### Testing
- Run all tests: `npm test`
- Run unit tests only: `npm run test:unit`
- See TESTING.md for detailed test documentation

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
- Detects runtime from fence markers (```sh, ```bash, ```js, ```python, ```ts, ```typescript)
- Creates clickable CodeLens annotations above code blocks
- Ignores lines starting with `//`

**executeAt** (executeAt.ts):
- Routes execution based on runtime type
- For Shell: executes directly
- For NodeJS: wraps in `node -e "..."`
- For Python: checks for python/python3 availability, wraps in `python -c "..."`
- For TypeScript: checks for tsx/ts-node availability
  - tsx: wraps in `tsx -e "..."`
  - ts-node: wraps in `ts-node --transpile-only --compiler-options '{"module":"commonjs","moduleResolution":"node"}' -e "..."` (flags avoid 'export {}' issue and tsconfig conflicts)
- Handles shell escaping for special characters: `"`, `` ` ``, `$`, `\`

**execute** (execute.ts):
- Manages terminal instances and tracks last used terminal
- Finds or creates available terminals (checks for closed/busy terminals)
- Sends commands to terminal with platform-specific adjustments:
  - PowerShell: replaces backslashes with backticks
  - CMD: removes backslashes and line breaks
- Prevents SSH execution based on user configuration

**Runtime Detection** (types/types.ts):
- Recognizes: ````sh`, ````bash`, ````js`, ````python`, ````ts`, ````typescript`
- Returns Runtime enum: Shell, NodeJs, Python, TypeScript

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

Comprehensive test suite with Mocha + Chai (see TESTING.md for details):

**Test Structure:**
- `src/test/suite/types.test.ts` - Runtime detection unit tests
- `src/test/suite/executeAt.test.ts` - Shell escaping unit tests
- `src/test/suite/commandCodeLensProvider.test.ts` - CodeLens provider integration tests
- `src/test/suite/extension.test.ts` - End-to-end extension tests
- `src/test/fixtures/test-cases.md` - All test case examples

**Running Tests:**
- `npm test` - Full test suite in VSCode instance
- `npm run test:unit` - Fast unit tests only
- `F5` > "Extension Tests" - Debug tests with breakpoints

**Test Coverage:**
All functionality is tested including: runtime detection, shell escaping, CodeLens generation, multi-line scripts, special characters, indentation preservation, and platform-specific shell handling.
