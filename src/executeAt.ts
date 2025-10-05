import * as vscode from 'vscode';
import { execute } from './execute';
import { Runtime } from './types/types';
import { detectExecutable } from './utils/runtimeDetector';
import { escapeForShell } from './utils/shellEscape';

export async function executeAt(
  runtime: string | undefined,
  selectedText: string
): Promise<void> {
  switch (runtime) {
    case Runtime.shell:
      await execute(selectedText);
      break;

    case Runtime.nodeJs:
      await execute(`node -e "${escapeForShell(selectedText)}"`);
      break;

    case Runtime.python:
      await executePythonCode(selectedText);
      break;

    case Runtime.typeScript:
      await executeTypeScriptCode(selectedText);
      break;
  }
}

async function executePythonCode(code: string): Promise<void> {
  const python = await detectExecutable(['python', 'python3']);

  if (python === 'none') {
    vscode.window.showInformationMessage(
      'Unable to find python or python3. Is it installed?'
    );
    return;
  }

  await execute(`${python} -c "${escapeForShell(code)}"`);
}

async function executeTypeScriptCode(code: string): Promise<void> {
  const tsRuntime = await detectExecutable(['tsx', 'ts-node']);

  if (tsRuntime === 'none') {
    vscode.window.showInformationMessage(
      'Unable to find tsx or ts-node. Is it installed?'
    );
    return;
  }

  if (tsRuntime === 'tsx') {
    await execute(`tsx -e "${escapeForShell(code)}"`);
  } else {
    const tsNodeFlags = `--transpile-only --compiler-options '{"module":"commonjs","moduleResolution":"node"}'`;
    await execute(`ts-node ${tsNodeFlags} -e "${escapeForShell(code)}"`);
  }
}
