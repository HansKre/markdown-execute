// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
// promisify cp.exec
const util = require('util');
export const exec = util.promisify(require('child_process').exec);
import { CommandCodeLensProvider } from './commandCodeLensProvider';
import { executeAt } from './executeAt';
import { Command, Runtime } from './types/types';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'markdown-execute.execute',
      async (args) => {
        if (!args?.runtime) {
          vscode.window.showInformationMessage('No runtime selected.');
          return;
        }
        if (!args?.command) {
          vscode.window.showInformationMessage(
            'Empty command, nothing to execute.'
          );
          return;
        }
        executeAt(args.runtime, args.command);
      }
    )
  );
  // Add the command to markdown files
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      { language: 'markdown', scheme: 'file' },
      new CommandCodeLensProvider()
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'markdown-execute.executeSelection',
      async () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
          vscode.window.showInformationMessage(
            'Could not detect an active editor.'
          );
          return;
        }

        const lines = activeEditor.document.getText().split('\n');
        let selectedText = '';
        for (
          let i = activeEditor.selection.start.line;
          i <= activeEditor.selection.end.line;
          i++
        ) {
          // exactly one line selected
          if (
            activeEditor.selection.start.line ===
            activeEditor.selection.end.line
          ) {
            selectedText += newSelection(
              lines[i],
              activeEditor.selection.start.character,
              activeEditor.selection.end.character
            );
            continue;
          }
          // multiple lines selected: first line
          if (i === activeEditor.selection.start.line) {
            selectedText += newSelection(
              lines[i],
              activeEditor.selection.start.character,
              lines[i].length
            );
            continue;
          }
          // multiple lines selected: last line
          if (i === activeEditor.selection.end.line) {
            selectedText += newSelection(
              lines[i],
              0,
              activeEditor.selection.end.character
            );
            continue;
          }
          // multiple lines selected: lines in between
          selectedText += newSelection(lines[i], 0, lines[i].length);
        }

        // remove the last line break
        selectedText = selectedText.substring(0, selectedText.length - 1);
        // console.log(selectedText);

        if (!selectedText) {
          vscode.window.showInformationMessage('Nothing selected');
          return;
        }

        let options: vscode.InputBoxOptions = {
          prompt: 'Select runtime: ',
          placeHolder: '(execution runtime)',
        };

        const runtime = await vscode.window.showQuickPick(
          Object.values(Runtime),
          options
        );

        executeAt(runtime, selectedText);
      }
    )
  );
}

function newSelection(line: string, start: number, stop: number) {
  const selection = line.substring(start, stop).trim();
  if (selection && !selection.startsWith('//')) {
    return selection + '\n';
  }
  return '';
}

// this method is called when your extension is deactivated
export function deactivate() {}
