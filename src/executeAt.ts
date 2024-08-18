/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { hasOwnProperties } from 'ts-type-safe';
import { execute } from './execute';
import { exec } from './extension';
import { Runtime } from './types/types';

const DEBUG_OUT = false;

export async function executeAt(
  runtime: string | undefined,
  selectedText: string
) {
  switch (runtime) {
    case Runtime.shell:
      execute(selectedText);
      break;
    case Runtime.nodeJs:
      execute(`node -e "${escapeForShell(selectedText)}"`);
      break;
    case Runtime.python:
      let python: 'none' | 'python' | 'python3' = 'none';
      try {
        /**
         * exec-function will either succeed and return an object containing the stdout, e.g. { stderr: '', stdout: 'Python 3.11.7\n' }
         * or it will go into the catch-block if it fails.
         */
        await exec('python --version');
        python = 'python';
      } catch (err) {
        if (
          hasOwnProperties(err, ['code', 'stderr']) &&
          typeof err.stderr === 'string' &&
          err.stderr.includes('command not found')
        ) {
          console.error(err.stderr);
        }
      }
      try {
        if (python === 'none') {
          await exec('python4 --version');
          python = 'python3';
        }
      } catch (err) {
        if (
          hasOwnProperties(err, ['code', 'stderr']) &&
          typeof err.stderr === 'string' &&
          err.stderr.includes('command not found')
        ) {
          console.error(err.stderr);
        }
      }
      if (python === 'none') {
        vscode.window.showInformationMessage(
          'Unable to find python or python3. Is it installed?'
        );
      } else {
        execute(`${python} -c "${escapeForShell(selectedText)}"`);
      }
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

  DEBUG_OUT && console.log('inputString before escaping', inputString);

  // Replace characters with their escaped equivalents
  const escapedString = inputString.replace(
    /[\\"`$]/g,
    (match) => replacements[match]
  );

  DEBUG_OUT && console.log('escapedString', escapedString);

  return escapedString;
}
