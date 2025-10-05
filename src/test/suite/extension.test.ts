import * as assert from 'assert';
import { expect } from 'chai';
import * as vscode from 'vscode';
import * as path from 'path';

suite('Extension Integration Tests', () => {
  test('Extension should be present', () => {
    const extension = vscode.extensions.getExtension('hanskre.markdown-execute');
    assert.ok(extension);
  });

  test('Extension should activate', async () => {
    const extension = vscode.extensions.getExtension('hanskre.markdown-execute');
    await extension?.activate();
    assert.ok(extension?.isActive);
  });

  test('Should register markdown-execute.execute command', async () => {
    const commands = await vscode.commands.getCommands(true);
    const hasExecuteCommand = commands.includes('markdown-execute.execute');
    assert.ok(hasExecuteCommand);
  });

  test('Should register markdown-execute.executeSelection command', async () => {
    const commands = await vscode.commands.getCommands(true);
    const hasExecuteSelectionCommand = commands.includes('markdown-execute.executeSelection');
    assert.ok(hasExecuteSelectionCommand);
  });

  test('Should provide CodeLens in markdown files', async () => {
    // Create a temporary markdown file with code blocks
    const content = `# Test Document

\`\`\`sh
echo "hello world"
\`\`\`

\`\`\`js
console.log("test");
\`\`\`

\`\`\`python
print("test")
\`\`\`
`;

    const doc = await vscode.workspace.openTextDocument({
      language: 'markdown',
      content: content,
    });

    await vscode.window.showTextDocument(doc);

    // Wait for CodeLens to be computed
    await new Promise((resolve) => setTimeout(resolve, 500));

    const codeLenses = await vscode.commands.executeCommand<vscode.CodeLens[]>(
      'vscode.executeCodeLensProvider',
      doc.uri
    );

    expect(codeLenses).to.not.be.undefined;
    expect(codeLenses!.length).to.be.greaterThan(0);

    // Should have 3 code lenses (one for each code block)
    expect(codeLenses!.length).to.equal(3);

    // Check that the commands are correct
    const shellLens = codeLenses!.find((lens) =>
      lens.command?.title.includes('Shell-Script')
    );
    expect(shellLens).to.not.be.undefined;

    const jsLens = codeLenses!.find((lens) =>
      lens.command?.title.includes('NodeJs-Script')
    );
    expect(jsLens).to.not.be.undefined;

    const pythonLens = codeLenses!.find((lens) =>
      lens.command?.title.includes('Python-Script')
    );
    expect(pythonLens).to.not.be.undefined;
  });

  test('Should not provide CodeLens for unsupported languages', async () => {
    const content = `# Test Document

\`\`\`json
{ "foo": "bar" }
\`\`\`

\`\`\`typescript
const x: number = 42;
\`\`\`
`;

    const doc = await vscode.workspace.openTextDocument({
      language: 'markdown',
      content: content,
    });

    await vscode.window.showTextDocument(doc);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const codeLenses = await vscode.commands.executeCommand<vscode.CodeLens[]>(
      'vscode.executeCodeLensProvider',
      doc.uri
    );

    // Should have no code lenses for unsupported languages
    expect(codeLenses?.length || 0).to.equal(0);
  });

  test('Configuration should be accessible', () => {
    const config = vscode.workspace.getConfiguration('markdown-execute');

    // Check that configuration exists
    expect(config).to.not.be.undefined;

    // Check default values
    const executeInSsh = config.get('executeInSsh');
    const confirmation = config.get('confirmation');

    // These should have values (either default or user-set)
    expect(executeInSsh).to.not.be.undefined;
    expect(confirmation).to.not.be.undefined;
  });

  // Note: Keybindings are defined in package.json and cannot be easily tested
  // in the extension test suite. They are verified through manual testing.
});
