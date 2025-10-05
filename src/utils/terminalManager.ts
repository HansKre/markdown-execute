import * as vscode from 'vscode';
import { hasOwnProperty } from 'ts-type-safe';

let lastUsedTerminal: vscode.Terminal | undefined;
let didRegisterTerminalHandlers = false;

async function findAvailableTerminal(
  terminals: readonly vscode.Terminal[]
): Promise<vscode.Terminal | undefined> {
  for (const terminal of terminals) {
    if (!terminal.exitStatus) {
      return terminal;
    }
  }
  return undefined;
}

function adjustCommandForShell(command: string, terminal: vscode.Terminal): string {
  const isWrappedCommand = command.includes('node -e') || command.includes('python -c');

  if (!isWrappedCommand || !hasOwnProperty(terminal.creationOptions, 'shellPath')) {
    return command;
  }

  const shellPath = terminal.creationOptions.shellPath;
  if (typeof shellPath !== 'string') {
    return command;
  }

  if (shellPath.includes('powershell')) {
    let adjusted = command;
    if (command.includes('node -e')) {
      adjusted = adjusted.replaceAll('\\', '`');
    }
    if (command.includes('python -c')) {
      adjusted = adjusted.replaceAll('\\"', `'`);
    }
    return adjusted;
  }

  if (shellPath.includes('cmd')) {
    return command
      .replaceAll('\\', '')
      .replace(/(\r\n|\n|\r)/gm, '');
  }

  return command;
}

function sendMultilineCommand(terminal: vscode.Terminal, command: string): void {
  const lines = command.split('\n');
  for (const line of lines) {
    terminal.sendText(line, true);
  }
}

function registerTerminalHandlers(): void {
  if (didRegisterTerminalHandlers) {
    return;
  }

  vscode.window.onDidCloseTerminal((terminal) => {
    if (terminal === lastUsedTerminal) {
      lastUsedTerminal = undefined;
    }
  });

  vscode.window.onDidChangeActiveTerminal((terminal) => {
    lastUsedTerminal = terminal;
  });

  didRegisterTerminalHandlers = true;
}

export async function getOrCreateTerminal(): Promise<vscode.Terminal> {
  let terminal = lastUsedTerminal || vscode.window.activeTerminal;

  if (!terminal) {
    terminal = await findAvailableTerminal(vscode.window.terminals);
  }

  if (!terminal) {
    terminal = vscode.window.createTerminal();
  }

  return terminal;
}

export function executeInTerminal(terminal: vscode.Terminal, command: string): void {
  lastUsedTerminal = terminal;
  registerTerminalHandlers();

  const adjustedCommand = adjustCommandForShell(command, terminal);

  terminal.show();

  if (adjustedCommand.includes('\n')) {
    sendMultilineCommand(terminal, adjustedCommand);
  } else {
    terminal.sendText(adjustedCommand);
  }

  vscode.window.showInformationMessage('Code block sent to terminal for execution!');
}
