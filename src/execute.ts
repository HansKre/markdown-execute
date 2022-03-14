import * as vscode from 'vscode';
import { exec } from './extension';

const DEBUG_OUT = false;

function sendToTerminal(term: vscode.Terminal, command: string) {
  term.show();
  term.sendText(command);
}

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
  vscode.window.showInformationMessage(
    'Code block sent to terminal for execution!'
  );
  // get the extension config
  const { executeInSsh } =
    vscode.workspace.getConfiguration('markdown-execute');
  // get active terminal or create new one
  let term = vscode.window.activeTerminal;
  if (!term) {
    DEBUG_OUT && console.log('No active terminal. Creating new.');
    term = vscode.window.createTerminal();
    sendToTerminal(term, command);
    return;
  }
  // get the process id of active terminal
  const pid = await term.processId;
  // get the state of the terminal
  /**
   * note: `ps -o state= -p ${pid}` is not a reliable way to check
   * if a termin is busy. One of the reasons seems to be that state
   * is not consistent between distributions, e.g. Ubuntu seems to
   * return 'S' for 'sleeping', even if terminal is executing work.
   *
   * To check if terminal is busy, we check for child processes instead
   * Commands are executed as child processes.
   * If there are none, we can assume that terminal is not busy
   */
  try {
    // get the terminal's child processes
    const { stdout: childProcessesStdout } = await exec(`pgrep -P ${pid}`);
    if (childProcessesStdout && !isNaN(childProcessesStdout)) {
      // get the command of the child process
      const { stdout: childProcessCmdStdout } = await exec(
        `ps -o command= -p ${childProcessesStdout}`
      );
      DEBUG_OUT &&
        console.log('Terminal is running command:', childProcessCmdStdout);
      if (
        (childProcessCmdStdout?.includes('ssh') ||
          childProcessCmdStdout?.includes('kubectl exec')) &&
        executeInSsh
      ) {
        // child process is ssh and executeInSsh is enabled
        DEBUG_OUT &&
          console.log(
            'Terminal is executing ssh session and executeInSsh is true'
          );
        sendToTerminal(term, command);
        return;
      }
    }
  } catch (error) {
    // cp.exec throws an error if the command returns exit-code 1, e.g. an empty response
    // pgrep returns exit code:1 if no processes matched or none of them could be signalled.
    // we need to handle this case in catch-block
    // since exit-code:1 is treated as 'Error: Command failed'
    // there are no child processes, so the terminal is not busy
    DEBUG_OUT && console.log(error);
    DEBUG_OUT && console.log('No child processes, hence terminal is not busy.');
    sendToTerminal(term, command);
    return;
  }
  // if we're here, the terminal is busy with a non-ssh process
  // or user doesn't allow ssh execution
  // create a new term
  DEBUG_OUT && console.log('Creating new terminal');
  term = vscode.window.createTerminal();
  // execute the command in the new terminal
  sendToTerminal(term, command);
  return;
}
