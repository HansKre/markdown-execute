import vscode = require('vscode');

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
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // detect the start of a command block
      if (
        !inCommand &&
        (line.startsWith('```sh') || line.startsWith('```bash'))
      ) {
        inCommand = true;
        commandStartLine = i;
        continue;
      }

      if (inCommand) {
        // add line to current command
        if (line !== '```') {
          currentCommand += line + '\n';
          continue;
        }
        // register the command block
        if (line === '```') {
          registerCommandBlock(currentCommand, codeLenses, commandStartLine);
          inCommand = false;
          currentCommand = '';
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
function registerCommandBlock(
  currentCommand: string,
  codeLenses: vscode.CodeLens[],
  commandStartLine: number
) {
  const cmd: vscode.Command = {
    title: 'Execute command in terminal',
    command: 'markdown-execute.execute',
    arguments: [{ command: currentCommand }],
  };
  codeLenses.push(
    new vscode.CodeLens(
      new vscode.Range(
        new vscode.Position(commandStartLine, 0),
        new vscode.Position(commandStartLine + 1, 0)
      ),
      cmd
    )
  );
}
