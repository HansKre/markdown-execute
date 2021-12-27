import * as vscode from 'vscode';
import { exec } from './extension';

/**
 * Method to execute a command in the terminal.
 * Aquires a non-busy terminal, shows and focuses at it
 * and executes the command.
 *
 * @param command a string of commands to execute as a shell command
 * @returns nothing
 */
export async function execute(command: string | null): Promise<void> {
  if (!command) {
    return;
  }
  vscode.window.showInformationMessage('Sent to terminal for execution!');
  // get the extension config
  const { executeInSsh } =
    vscode.workspace.getConfiguration('markdown-execute');
  // get active terminal or create new one
  const term = vscode.window.activeTerminal || vscode.window.createTerminal();
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
      term.sendText(command);
      return;
    }
    // check if there's a running command in the active terminal
    if (stateStdout?.includes('+')) {
      // a + in the state indicates a process running in foreground
      // so our terminal is not busy
      // hence we can send the command to the terminal
      term.show();
      term.sendText(command);
      return;
    }
    // if we're here, the terminal is busy
    // to check if the the foreground process is ssh,
    // we need to get the terminal's child process first
    const { stdout: childProcessesStdout } = await exec(`pgrep -P ${pid}`);
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
        term.sendText(command);
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
  newTerm.sendText(command);
  return;
}
