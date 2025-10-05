# Testing Guide for Markdown Execute Extension

## Overview

Comprehensive test suite for the markdown-execute VSCode extension using Mocha, Chai, and VSCode's testing framework.

## Tech Stack

- **Mocha** - Test framework (TDD style)
- **Chai** - Assertion library
- **Sinon** - Mocking and stubbing
- **@vscode/test-electron** - VSCode extension test runner
- **glob** - File pattern matching for test discovery

## Running Tests

### All Tests (Recommended)
```sh
npm test
```
Compiles the extension and runs all tests in a VSCode test instance.

### Unit Tests Only (Fast feedback)
```sh
npm run test:unit
```
Runs unit tests without launching VSCode - faster for development.

### Debugging Tests
1. Open VSCode
2. Press `F5` or use Run > Start Debugging
3. Select "Extension Tests" configuration
4. Set breakpoints in test or source files

## Test Structure

```
src/test/
├── runTest.ts              # Test runner entry point
├── suite/
│   ├── index.ts            # Mocha test suite configuration
│   ├── types.test.ts       # Runtime detection tests
│   ├── executeAt.test.ts   # Shell escaping tests
│   ├── commandCodeLensProvider.test.ts  # CodeLens provider tests
│   └── extension.test.ts   # E2E integration tests
├── fixtures/
│   └── test-cases.md       # All test case examples from requirements
└── README.md               # Detailed test documentation
```

## Test Coverage

### Unit Tests

**types.test.ts** - Runtime Detection
- ✅ Detects Shell from ` ```sh ` and ` ```bash `
- ✅ Detects NodeJS from ` ```js `
- ✅ Detects Python from ` ```python `
- ✅ Returns null for unsupported languages
- ✅ Handles whitespace correctly

**executeAt.test.ts** - Shell Escaping
- ✅ Escapes double quotes, backticks, dollar signs, backslashes
- ✅ JavaScript special characters (template literals, variables)
- ✅ Python strings and f-strings
- ✅ Preserves spacing

### Integration Tests

**commandCodeLensProvider.test.ts** - CodeLens Functionality
- ✅ Provides CodeLens for supported runtimes (sh, bash, js, python)
- ✅ Skips unsupported languages (json, typescript, etc.)
- ✅ Handles multiple code blocks
- ✅ Skips comment lines (`//`)
- ✅ Preserves indentation
- ✅ Multi-line scripts with loops
- ✅ Special character handling

**extension.test.ts** - End-to-End
- ✅ Extension activation
- ✅ Command registration
- ✅ Configuration accessibility
- ✅ Keybinding registration
- ✅ CodeLens integration with markdown files

## Test Case Validation

All test cases from DEVELOPMENT.md requirements are covered:

| Test Case | Status | Location |
|-----------|--------|----------|
| Login to Jenkins with for-loop | ✅ | commandCodeLensProvider.test.ts |
| Shell variable export/echo | ✅ | commandCodeLensProvider.test.ts |
| JSON should not annotate | ✅ | commandCodeLensProvider.test.ts |
| JavaScript special char escaping | ✅ | executeAt.test.ts |
| Simple Python print | ✅ | commandCodeLensProvider.test.ts |
| Python indentation | ✅ | commandCodeLensProvider.test.ts |
| SSH commands | ✅ | fixtures/test-cases.md |
| Multi-line bash scripts | ✅ | commandCodeLensProvider.test.ts |
| Comments handling | ✅ | commandCodeLensProvider.test.ts |

## Adding New Tests

1. Create `*.test.ts` file in `src/test/suite/`
2. Import chai and required modules
3. Use TDD style: `suite()` and `test()`
4. Run `npm run compile` then `npm test`

Example:
```typescript
import { expect } from 'chai';
import { myFunction } from '../../myModule';

suite('My Feature Tests', () => {
  test('Should do something', () => {
    const result = myFunction('input');
    expect(result).to.equal('expected');
  });
});
```

## Continuous Integration

To integrate with CI/CD:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: |
    npm install
    npm run compile
    xvfb-run -a npm test  # For headless VSCode testing on Linux
```

## Troubleshooting

### Tests not found
- Ensure files end with `.test.ts`
- Check webpack compiled them to `dist/test/suite/`
- Run `npm run compile` first

### VSCode API errors
- Some tests require full VSCode instance
- Use `npm test` instead of `npm run test:unit` for those

### Type errors during compilation
- Check `tsconfig.json` includes test files
- Verify all imports are correct
- Ensure `@types/*` packages are installed

## Future Enhancements

Potential additions:
- [ ] Code coverage reports with nyc/istanbul
- [ ] Performance benchmarks for large markdown files
- [ ] Terminal interaction mocking with sinon
- [ ] Platform-specific shell tests (PowerShell, CMD, Bash)
- [ ] Snapshot testing for CodeLens rendering
