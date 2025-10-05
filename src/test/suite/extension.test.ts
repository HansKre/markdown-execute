import * as assert from 'assert';
import { expect } from 'chai';
import * as vscode from 'vscode';
import * as sinon from 'sinon';

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

\`\`\`yaml
foo: bar
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

  test('Should send multi-line shell commands with preserved indentation', async () => {
    const content = `# Test Multi-line Echo

\`\`\`bash
echo "services:
  caddy:
    image: caddy:alpine
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile"
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

    expect(codeLenses).to.not.be.undefined;
    expect(codeLenses!.length).to.equal(1);

    // Verify the command includes the full multi-line content
    const bashLens = codeLenses![0];
    expect(bashLens.command?.arguments).to.not.be.undefined;
    const commandText = bashLens.command?.arguments![0].command;
    expect(commandText).to.include('services:');
    expect(commandText).to.include('  caddy:');
    expect(commandText).to.include('    image: caddy:alpine');
    expect(commandText).to.include('      - ./Caddyfile:/etc/caddy/Caddyfile');
  });

  // Note: Keybindings are defined in package.json and cannot be easily tested
  // in the extension test suite. They are verified through manual testing.
});

suite('Confirmation Mode Tests', () => {
  let showQuickPickStub: sinon.SinonStub;
  let showInformationMessageStub: sinon.SinonStub;
  let configStub: sinon.SinonStub;

  setup(() => {
    showQuickPickStub = sinon.stub(vscode.window, 'showQuickPick');
    showInformationMessageStub = sinon.stub(vscode.window, 'showInformationMessage');
    configStub = sinon.stub(vscode.workspace, 'getConfiguration');
  });

  teardown(() => {
    sinon.restore();
  });

  test('Should execute without confirmation when mode is "none"', async () => {
    configStub.returns({
      get: (key: string, defaultValue?: any) => {
        if (key === 'confirmation') {return 'none';}
        if (key === 'executeInSsh') {return true;}
        return defaultValue;
      },
    });

    await vscode.commands.executeCommand('markdown-execute.execute', {
      runtime: 'Shell',
      command: 'echo "test"',
    });

    // Should not show any confirmation dialogs (QuickPick or modal/message before execution)
    expect(showQuickPickStub.called).to.be.false;
    // Note: showInformationMessage might be called for other reasons (like terminal errors),
    // but it should NOT be called with the confirmation prompt
    const confirmationCalls = showInformationMessageStub.getCalls().filter(
      (call) => call.args[0]?.includes('Execute this code block')
    );
    expect(confirmationCalls.length).to.equal(0);
  });

  test('Should show QuickPick confirmation when mode is "pick"', async () => {
    configStub.returns({
      get: (key: string, defaultValue?: any) => {
        if (key === 'confirmation') {return 'pick';}
        return defaultValue;
      },
    });

    showQuickPickStub.resolves('Execute');

    await vscode.commands.executeCommand('markdown-execute.execute', {
      runtime: 'Shell',
      command: 'echo "test"',
    });

    // Should show QuickPick
    expect(showQuickPickStub.calledOnce).to.be.true;
    expect(showQuickPickStub.firstCall.args[0]).to.deep.equal(['Execute', 'Cancel']);
    expect(showQuickPickStub.firstCall.args[1]).to.have.property('placeHolder');
  });

  test('Should cancel execution when user selects "Cancel" in pick mode', async () => {
    configStub.returns({
      get: (key: string, defaultValue?: any) => {
        if (key === 'confirmation') {return 'pick';}
        return defaultValue;
      },
    });

    showQuickPickStub.resolves('Cancel');

    await vscode.commands.executeCommand('markdown-execute.execute', {
      runtime: 'Shell',
      command: 'echo "test"',
    });

    expect(showQuickPickStub.calledOnce).to.be.true;
    // Verify that a cancellation message was shown
    expect(showInformationMessageStub.calledWith('Execution cancelled.')).to.be.true;
  });

  test('Should show message confirmation when mode is "message"', async () => {
    configStub.returns({
      get: (key: string, defaultValue?: any) => {
        if (key === 'confirmation') {return 'message';}
        if (key === 'executeInSsh') {return true;}
        return defaultValue;
      },
    });

    showInformationMessageStub.resolves('Execute');

    await vscode.commands.executeCommand('markdown-execute.execute', {
      runtime: 'Shell',
      command: 'echo "test"',
    });

    // Should show information message
    const confirmationCalls = showInformationMessageStub.getCalls().filter(
      (call) => call.args[0]?.includes('Execute this code block')
    );
    expect(confirmationCalls.length).to.be.greaterThan(0);
    const call = confirmationCalls[0];
    expect(call.args[0]).to.include('Execute this code block');
    expect(call.args[1]).to.equal('Execute');
    expect(call.args[2]).to.equal('Cancel');
  });

  test('Should show modal confirmation when mode is "modal"', async () => {
    configStub.returns({
      get: (key: string, defaultValue?: any) => {
        if (key === 'confirmation') {return 'modal';}
        if (key === 'executeInSsh') {return true;}
        return defaultValue;
      },
    });

    showInformationMessageStub.resolves('Execute');

    await vscode.commands.executeCommand('markdown-execute.execute', {
      runtime: 'Shell',
      command: 'echo "test"',
    });

    // Should show modal information message
    const confirmationCalls = showInformationMessageStub.getCalls().filter(
      (call) => call.args[0]?.includes('Execute this code block')
    );
    expect(confirmationCalls.length).to.be.greaterThan(0);
    const call = confirmationCalls[0];
    expect(call.args[0]).to.include('Execute this code block');
    // Should have modal option
    expect(call.args[1]).to.deep.equal({ modal: true });
    expect(call.args[2]).to.equal('Execute');
  });

  test('Should handle empty runtime', async () => {
    configStub.returns({
      get: (key: string, defaultValue?: any) => {
        if (key === 'confirmation') {return 'none';}
        return defaultValue;
      },
    });

    await vscode.commands.executeCommand('markdown-execute.execute', {
      runtime: null,
      command: 'echo "test"',
    });

    // Should show message about no runtime
    expect(showInformationMessageStub.calledWith('No runtime selected.')).to.be.true;
  });

  test('Should handle empty command', async () => {
    configStub.returns({
      get: (key: string, defaultValue?: any) => {
        if (key === 'confirmation') {return 'none';}
        return defaultValue;
      },
    });

    await vscode.commands.executeCommand('markdown-execute.execute', {
      runtime: 'Shell',
      command: '',
    });

    // Should show message about empty command
    expect(showInformationMessageStub.calledWith('Empty command, nothing to execute.')).to.be.true;
  });
});
