import vscode = require('vscode');
import { Command, Runtime, detectRuntime } from './types/types';

/**
 * Handles the creation of code lenses in markdown-files
 * Code lenses are annotations in certain file-types
 * Adds following annotation to code-blocks:
 * 'Execute command in terminal as ${runtime}-Script' code lenses
 */
export class CommandCodeLensProvider implements vscode.CodeLensProvider {
  provideCodeLenses(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeLens[]> {
    const codeLenses: vscode.CodeLens[] = [];
    const lines = document.getText().split('\n');

    let inCommand = false;
    let currentCommand = '';
    let commandStartLine = 0;
    let runtime = null;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // detect start of a command block
      if (!inCommand && detectRuntime(line)) {
        inCommand = true;
        commandStartLine = i;
        runtime = detectRuntime(line);
        continue;
      }

      if (inCommand && runtime) {
        // add line to current command
        if (line !== '```' && !line.startsWith('//')) {
          // add the untrimmed line
          currentCommand += lines[i];
          // add line-break, but only, if not the very last line
          if (lines[i + 1].trim() !== '```') currentCommand += '\n';
          continue;
        }
        // register the command block
        if (line === '```') {
          annotateCommandBlock(
            currentCommand,
            codeLenses,
            commandStartLine,
            runtime
          );
          inCommand = false;
          currentCommand = '';
          runtime = null;
          continue;
        }
      }
    }
    return codeLenses;
  }

  // not used, only for interface compliance
  resolveCodeLens?(
    codeLens: vscode.CodeLens,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeLens> {
    return null;
  }

  // not used, only for interface compliance
  onDidChangeCodeLenses?: vscode.Event<void>;
}

function annotateCommandBlock(
  command: string,
  codeLenses: vscode.CodeLens[],
  commandStartLine: number,
  runtime: Runtime
) {
  const arg: Command = { command, runtime };

  const annotation: vscode.Command = {
    title: `Execute command in terminal as ${runtime}-Script`,
    command: 'markdown-execute.execute',
    tooltip:
      'Focuses on previously active terminal and sends code block for execution',
    arguments: [arg],
  };
  const range = new vscode.Range(
    new vscode.Position(commandStartLine, 0),
    new vscode.Position(commandStartLine + 1, 0)
  );

  codeLenses.push(new vscode.CodeLens(range, annotation));
}
