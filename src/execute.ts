import * as vscode from 'vscode';
import { exec } from './extension';
import { hasOwnProperties } from 'ts-type-safe';

const DEBUG_OUT = false;

function sendToTerminal(term: vscode.Terminal, command: string) {
  term.show();
  term.sendText(command);

  vscode.window.showInformationMessage(
    'Code block sent to terminal for execution!'
  );
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

  // get active terminal or create new one
  let term = vscode.window.activeTerminal;

  if (!term) {
    DEBUG_OUT &&
      console.log(
        'vscode.window.terminals.length',
        vscode.window.terminals.length
      );
    DEBUG_OUT &&
      console.log('No active terminal. Trying to find an available one.');

    term = await findAsyncSequential(vscode.window.terminals, async (t) => {
      if (t.exitStatus) {
        return false;
      }
      return await isAvailable(t);
    });

    if (!term) {
      DEBUG_OUT &&
        console.log('No available terminal found. Creating new one.');
      term = vscode.window.createTerminal();
    }

    sendToTerminal(term, command);
    return;
  }

  if (!(await isAvailable(term))) {
    // if we're here, the terminal is busy with a non-ssh process
    // or user doesn't allow ssh execution
    // create a new term
    DEBUG_OUT && console.log('Creating new terminal');
    term = vscode.window.createTerminal();
  }
  // execute the command in the new terminal
  sendToTerminal(term, command);
}

async function isAvailable(term: vscode.Terminal): Promise<boolean> {
  DEBUG_OUT && console.log('Checking if available', term);

  // get the extension config
  const { executeInSsh } =
    vscode.workspace.getConfiguration('markdown-execute');

  // get the process id of active terminal
  const pid = await term.processId;
  // get the state of the terminal
  /**
   * note: `ps -o state= -p ${pid}` is not a reliable way to check
   * if a terminal is busy. One of the reasons seems to be that state
   * is not consistent between distributions, e.g. Ubuntu seems to
   * return 'S' for 'sleeping', even if terminal is executing work.
   *
   * Hence, to check if terminal is busy, we shall check for child processes
   * instead (child processes is how user-commands are executed).
   * If there are none, we shall assume that terminal is not busy and is safe
   * to be used.
   */
  try {
    // get the terminal's child processes
    const { stdout: childProcessesStdout } = await exec(`pgrep -P ${pid}`);

    DEBUG_OUT && console.log('childProcessesStdout:', childProcessesStdout);

    if (childProcessesStdout && !isNaN(childProcessesStdout)) {
      // if here, current terminal is running at least one process
      // get the command of the child process
      const { stdout: childProcessCmdStdout } = await exec(
        `ps -o command= -p ${childProcessesStdout}`
      );

      DEBUG_OUT && console.log('childProcessCmdStdout:', childProcessCmdStdout);

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
        return true;
      }
      return false;
    }
    // note: this is only for TS-compiler. In real world, the catch-block is
    // run if there is no running process.
    return true;
  } catch (error) {
    // cp.exec throws an error if the command returns exit-code 1, e.g. an empty response
    // pgrep returns exit code:1 if no processes matched or none of them could be signalled.
    // we need to handle this case in catch-block
    // since exit-code:1 is treated as 'Error: Command failed'
    // there are no child processes, so the terminal is not busy
    if (hasOwnProperties(error, ['stdout', 'code', 'killed'])) {
      DEBUG_OUT && console.log(error);

      const isAvailable =
        typeof error.stdout === 'string' &&
        error.stdout === '' &&
        typeof error.code === 'number' &&
        error.code === 1 &&
        typeof error.killed === 'boolean' &&
        !error.killed;

      DEBUG_OUT &&
        isAvailable &&
        console.log('No child processes, hence terminal is not busy.');

      return isAvailable;
    }
    return false;
  }
}

async function findAsyncSequential<T>(
  array: readonly T[],
  predicate: (t: T) => Promise<boolean>
): Promise<T | undefined> {
  for (const t of array) {
    if (await predicate(t)) {
      return t;
    }
  }
  return undefined;
}
