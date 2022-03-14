import * as vscode from 'vscode';
import { exec } from './extension';

const DEBUG_OUT = false;
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
    term.show();
    term.sendText(command);
    return;
  }
  // get the process id of the terminal
  const pid = await term.processId;
  // get the state of the terminal
  try {
    const { stdout: stateStdout, stderr: stateStderr } = await exec(
      `ps -o state= -p ${pid}`
    );
    DEBUG_OUT && console.log({ pid, stateStdout, stateStderr });
    /**
     * PROCESS STATE CODES
       Here are the different values that the s, stat and state output specifiers (header "STAT" or "S") will display to describe the state of a process:
       D    uninterruptible sleep (usually IO)
       R    running or runnable (on run queue)
       S    interruptible sleep (waiting for an event to complete)
       T    stopped, either by a job control signal or because it is being traced.
       W    paging (not valid since the 2.6.xx kernel)
       X    dead (should never be seen)
       Z    defunct ("zombie") process, terminated but not reaped by its parent.

       For BSD formats and when the stat keyword is used, additional characters may be displayed:
       <    high-priority (not nice to other users)
       N    low-priority (nice to other users)
       L    has pages locked into memory (for real-time and custom IO)
       s    is a session leader
       l    is multi-threaded (using CLONE_THREAD, like NPTL pthreads do)
       +    is in the foreground process group.
     */
    // if (stateStderr || !stateStdout) {
    //   // if we can't check just send to the current one...
    //   term.show();
    //   term.sendText(command);
    //   return;
    // }
    // // check if there's a running command in the active terminal
    // if (
    //   // a + in the state indicates a process running in foreground
    //   // so our terminal is not busy
    //   // hence we can send the command to the terminal
    //   stateStdout?.includes('+') ||
    //   // terminal is sleeping
    //   stateStdout?.includes('S')
    // ) {
    //   term.show();
    //   term.sendText(command);
    //   return;
    // }

    // if we're here, the terminal is busy
    // to check if the the foreground process is ssh,
    // we need to get the terminal's child process first
    try {
      const { stdout: childProcessesStdout } = await exec(`pgrep -P ${pid}`);
      if (childProcessesStdout && !isNaN(childProcessesStdout)) {
        // then, get the command of the child process
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
          // if the child process is ssh and user allowed
          // execution in ssh sessions
          // we can send the command to it
          DEBUG_OUT &&
            console.log(
              'Terminal is executing ssh session and executeInSsh is true'
            );
          term.show();
          term.sendText(command);
          return;
        }
      }
    } catch (error) {
      // pgrep returns exit code:1 if no processes matched or none of them could be signalled.
      // we need to handle this case in catch-block
      // since exit-code:1 is treated as 'Error: Command failed'
      // there are no child processes, so the terminal is not busy
      DEBUG_OUT &&
        console.log('No child processes, hence terminal is not busy.');
      term.show();
      term.sendText(command);
      return;
    }
  } catch (err) {
    // cp.exec throws an error if the command returns exit-code 1, e.g. an empty response
    DEBUG_OUT && console.log(err);
  }
  // if we're here, the terminal is busy with a non-ssh process
  // or user doesn't allow ssh execution
  // create a new term
  DEBUG_OUT && console.log('Creating new terminal');
  const newTerm = vscode.window.createTerminal();
  // execute the command in the new terminal
  newTerm.show();
  newTerm.sendText(command);
  return;
}
