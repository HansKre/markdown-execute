export enum Runtime {
  shell = 'Shell',
  nodeJs = 'NodeJs',
  python = 'Python',
}

export interface Command {
  runtime: Runtime;
  command: string;
}

export function detectRuntime(line: string): Runtime | null {
  if (line.startsWith('```sh') || line.startsWith('```bash')) {
    return Runtime.shell;
  }
  if (line.startsWith('```js')) {
    return Runtime.nodeJs;
  }
  if (line.startsWith('```python')) {
    return Runtime.python;
  }
  return null;
}
