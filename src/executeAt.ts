/* eslint-disable @typescript-eslint/naming-convention */
import { execute } from './execute';
import { Runtime } from './types/types';

export function executeAt(runtime: string | undefined, selectedText: string) {
  switch (runtime) {
    case Runtime.shell:
      execute(selectedText);
      break;
    case Runtime.nodeJs:
      execute(`node -e "${escapeForShell(selectedText)}"`);
      break;
    default:
      break;
  }
}

function escapeForShell(inputString: string) {
  const replacements: { [key: string]: string } = {
    '"': '\\"',
    '`': '\\`',
    $: '\\$',
    '\\': '\\\\',
  };

  // Replace characters with their escaped equivalents
  const escapedString = inputString.replace(
    /[\\"`$]/g,
    (match) => replacements[match]
  );

  return escapedString;
}
