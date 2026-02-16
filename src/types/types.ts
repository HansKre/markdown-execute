export enum Runtime {
  shell = 'Shell',
  nodeJs = 'NodeJs',
  python = 'Python',
  typeScript = 'TypeScript',
  powershell = 'Powershell',
}

export interface Command {
  runtime: Runtime;
  command: string;
}

export function detectRuntime(line: string): Runtime | null {
  const trimmedLine = line.trim();
  if (trimmedLine === '```sh' || trimmedLine === '```bash') {
    return Runtime.shell;
  }
  if (trimmedLine === '```js') {
    return Runtime.nodeJs;
  }
  if (trimmedLine === '```python') {
    return Runtime.python;
  }
  if (trimmedLine === '```ts' || trimmedLine === '```typescript') {
    return Runtime.typeScript;
  }
  if (trimmedLine === '```powershell' || trimmedLine === '```pwsh') {
    return Runtime.powershell;
  }
  return null;
}
