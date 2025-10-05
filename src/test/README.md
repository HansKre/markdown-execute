# Test Suite for Markdown Execute Extension

## Overview

This test suite validates the functionality of the Markdown Execute VSCode extension using a comprehensive testing strategy.

## Test Stack

- **Mocha** - Test framework (TDD style)
- **Chai** - Assertion library
- **Sinon** - Mocking and stubbing
- **@vscode/test-electron** - VSCode extension testing harness

## Test Structure

### Unit Tests

#### `types.test.ts`
Tests runtime detection logic:
- Detects Shell runtime from ` ```sh ` and ` ```bash `
- Detects NodeJS runtime from ` ```js `
- Detects Python runtime from ` ```python `
- Returns null for unsupported languages
- Handles whitespace correctly

#### `executeAt.test.ts`
Tests shell escaping functionality:
- Escapes special characters: `"`, `` ` ``, `$`, `\`
- Validates JavaScript special character handling (template literals, variables)
- Validates Python string handling
- Preserves spaces and formatting

### Integration Tests

#### `commandCodeLensProvider.test.ts`
Tests CodeLens provider functionality:
- Provides correct CodeLens for each supported runtime
- Does not annotate unsupported languages (JSON, TypeScript, etc.)
- Handles multiple code blocks in one document
- Skips comment lines starting with `//`
- Preserves indentation in code blocks
- Handles multi-line shell scripts, for-loops, etc.
- Correctly escapes special characters in commands

#### `extension.test.ts`
End-to-end extension tests:
- Extension activation
- Command registration
- Configuration accessibility
- Keybinding registration
- CodeLens integration in markdown files

### Test Fixtures

#### `test-cases.md`
Contains all minimal test cases from requirements:
- Shell scripts with variables and loops
- JavaScript with special character escaping
- Python with indentation
- SSH commands
- Multi-line bash scripts
- Comments and unsupported languages

## Running Tests

### Run all tests (integration + unit)
```sh
npm test
```

This compiles the extension and runs the full test suite in a VSCode test instance.

### Run unit tests only
```sh
npm run test:unit
```

Faster feedback loop for unit tests without launching VSCode.

### Watch mode during development
```sh
npm run watch
```

Then run tests in another terminal.

## Test Coverage

The test suite validates:

1. **Runtime Detection** - All supported languages detected correctly
2. **Shell Escaping** - Special characters properly escaped for each shell type
3. **CodeLens Provider** - Annotations appear for supported code blocks only
4. **Command Execution** - Commands properly formatted and sent to terminal
5. **Configuration** - Settings accessible and properly typed
6. **Extension Lifecycle** - Activation, command registration, keybindings

## Test Cases Validation

All test cases from DEVELOPMENT.md are covered:
- ✅ Login to Jenkins and execute for-loop
- ✅ Shell variable export and echo
- ✅ JSON should not annotate
- ✅ JavaScript special character escaping
- ✅ Simple Python print
- ✅ Python indentation preservation
- ✅ SSH commands
- ✅ Multi-line bash scripts
- ✅ Comments handling

## Adding New Tests

1. Create a new `.test.ts` file in `src/test/suite/`
2. Import chai and required modules
3. Use `suite()` and `test()` from Mocha's TDD interface
4. Run `npm test` to validate

Example:
```typescript
import { expect } from 'chai';
import { myFunction } from '../../myModule';

suite('My Module Tests', () => {
  test('Should do something', () => {
    const result = myFunction('input');
    expect(result).to.equal('expected');
  });
});
```

## Debugging Tests

1. Open VSCode
2. Go to Run & Debug (Cmd+Shift+D)
3. Select "Extension Tests" from dropdown
4. Press F5 to launch tests in debug mode
5. Set breakpoints in test files or extension code
