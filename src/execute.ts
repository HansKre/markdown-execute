import { getOrCreateTerminal, executeInTerminal } from './utils/terminalManager';

export async function execute(command: string | null): Promise<void> {
  if (!command) {
    return;
  }

  const terminal = await getOrCreateTerminal();
  executeInTerminal(terminal, command);
}
