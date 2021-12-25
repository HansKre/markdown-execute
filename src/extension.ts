// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
// promisify cp.exec
const util = require('util');
const exec = util.promisify(require('child_process').exec);
import { CommandCodeLensProvider } from './commandCodeLensProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'markdown-execute.execute',
      async (args) => {
        vscode.window.showInformationMessage('Sent to terminal for execution!');
        // get the extension config
        const { executeInSsh } =
          vscode.workspace.getConfiguration('markdown-execute');
        // get active terminal or create new one
        const term =
          vscode.window.activeTerminal || vscode.window.createTerminal();
        // get the process id of the terminal
        const pid = await term.processId;
        // get the state of the terminal
        try {
          const { stdout: stateStdout, stderr: stateStderr } = await exec(
            `ps -o state= -p ${pid}`
          );
          if (stateStderr || !stateStdout) {
            // if we can't check just send to the current one...
            term.show();
            term.sendText(args.command);
            return;
          }
          // check if there's a running command in the active terminal
          if (stateStdout?.includes('+')) {
            // a + in the state indicates a process running in foreground
            // so our terminal is not busy
            // hence we can send the command to the terminal
            term.show();
            term.sendText(args.command);
            return;
          }
          // if we're here, the terminal is busy
          // to check if the the foreground process is ssh,
          // we need to get the terminal's child process first
          const { stdout: childProcessesStdout } = await exec(
            `pgrep -P ${pid}`
          );
          if (childProcessesStdout && !isNaN(childProcessesStdout)) {
            // then, get the command of the child process
            const { stdout: childProcessCmdStdout } = await exec(
              `ps -o command= -p ${childProcessesStdout}`
            );
            if (childProcessCmdStdout?.includes('ssh') && executeInSsh) {
              // if the child process is ssh and user allowed
              // execution in ssh sessions
              // we can send the command to it
              term.show();
              term.sendText(args.command);
              return;
            }
          }
        } catch (err) {
          // cp.exec throws an error if it would return an empty response
          console.log(err);
        }
        // if we're here, the terminal is busy with a non-ssh process
        // or user doesn't allow ssh execution
        // create a new term
        const newTerm = vscode.window.createTerminal();
        // execute the command in the new terminal
        newTerm.show();
        newTerm.sendText(args.command);
        return;
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
}

// this method is called when your extension is deactivated
export function deactivate() {}
