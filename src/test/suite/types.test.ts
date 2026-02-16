import { expect } from 'chai';
import { Runtime, detectRuntime } from '../../types/types';

suite('Runtime Detection Tests', () => {
  test('Should detect Shell runtime from ```sh', () => {
    const result = detectRuntime('```sh');
    expect(result).to.equal(Runtime.shell);
  });

  test('Should detect Shell runtime from ```bash', () => {
    const result = detectRuntime('```bash');
    expect(result).to.equal(Runtime.shell);
  });

  test('Should detect NodeJS runtime from ```js', () => {
    const result = detectRuntime('```js');
    expect(result).to.equal(Runtime.nodeJs);
  });

  test('Should detect Python runtime from ```python', () => {
    const result = detectRuntime('```python');
    expect(result).to.equal(Runtime.python);
  });

  test('Should detect TypeScript runtime from ```ts', () => {
    const result = detectRuntime('```ts');
    expect(result).to.equal(Runtime.typeScript);
  });

  test('Should detect TypeScript runtime from ```typescript', () => {
    const result = detectRuntime('```typescript');
    expect(result).to.equal(Runtime.typeScript);
  });

  test('Should detect PowerShell runtime from ```powershell', () => {
    const result = detectRuntime('```powershell');
    expect(result).to.equal(Runtime.powershell);
  });

  test('Should detect PowerShell runtime from ```pwsh', () => {
    const result = detectRuntime('```pwsh');
    expect(result).to.equal(Runtime.powershell);
  });

  test('Should return null for unsupported runtime', () => {
    const result = detectRuntime('```json');
    expect(result).to.be.null;
  });

  test('Should handle whitespace around runtime markers', () => {
    expect(detectRuntime('  ```sh  ')).to.equal(Runtime.shell);
    expect(detectRuntime('  ```bash  ')).to.equal(Runtime.shell);
    expect(detectRuntime('  ```js  ')).to.equal(Runtime.nodeJs);
    expect(detectRuntime('  ```python  ')).to.equal(Runtime.python);
    expect(detectRuntime('  ```ts  ')).to.equal(Runtime.typeScript);
    expect(detectRuntime('  ```typescript  ')).to.equal(Runtime.typeScript);
    expect(detectRuntime('  ```powershell  ')).to.equal(Runtime.powershell);
    expect(detectRuntime('  ```pwsh  ')).to.equal(Runtime.powershell);
  });

  test('Should return null for empty string', () => {
    expect(detectRuntime('')).to.be.null;
  });

  test('Should return null for just backticks', () => {
    expect(detectRuntime('```')).to.be.null;
  });
});
