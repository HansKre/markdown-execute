import { execute } from './execute';
import { Runtime } from './types/types';

export function executeAt(runtime: string | undefined, selectedText: string) {
  switch (runtime) {
    case Runtime.shell:
      execute(selectedText);
      break;
    case Runtime.nodeJs:
      execute(`node -e "${selectedText.replaceAll(`"`, `'`)}"`);
      break;
    default:
      break;
  }
}
