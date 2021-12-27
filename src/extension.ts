// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
// promisify cp.exec
const util = require('util');
export const exec = util.promisify(require('child_process').exec);
import { CommandCodeLensProvider } from './commandCodeLensProvider';
import { execute } from './execute';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'markdown-execute.execute',
      async (args) => {
        execute(args.command);
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
          return;
        }

        const lines = activeEditor.document.getText().split('\n');
        const selectedLine = lines[activeEditor.selection.start.line];
        const selectedText = selectedLine.slice(
          activeEditor.selection.start.character,
          activeEditor.selection.end.character
        );

        if (!selectedText) {
          vscode.window.showInformationMessage('Nothing selected');
          return;
        }

        let options: vscode.InputBoxOptions = {
          prompt: 'Select runtime: ',
          placeHolder: '(execution runtime)',
        };

        const runtime = await vscode.window.showQuickPick(
          ['Shell', 'NodeJs'],
          options
        );
        vscode.window.showInformationMessage(
          `Executing as ${runtime} command!`
        );

        switch (runtime) {
          case 'Shell':
            execute(selectedText);
            break;
          case 'NodeJs':
            execute(`node -e "${selectedText.replaceAll(`"`, `'`)}"`);
            break;
          default:
            break;
        }
      }
    )
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
