import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { expect } from 'chai';
import { executeAt } from '../../executeAt';
import { Runtime } from '../../types/types';
import * as vscode from 'vscode';

suite('Execution Tests', () => {
  const filesToCleanup: string[] = [];

  afterEach(() => {
    filesToCleanup.forEach((filePath) => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    filesToCleanup.length = 0;
  });

  function getTempFilePath(): string {
    const filePath = path.join(
      os.tmpdir(),
      `vscode-ext-test-${Date.now()}.txt`
    );
    filesToCleanup.push(filePath);
    return filePath;
  }

  test('Should execute PowerShell and capture output', async function () {
    this.timeout(10000); // Increase timeout for this test

    // Arrange
    const tempFilePath = getTempFilePath();
    const command = `Write-Output "PowerShell works!" | Out-File -FilePath '${tempFilePath}' -Encoding utf8`;
    const config = vscode.workspace.getConfiguration('markdown-execute');
    await config.update('confirmation', 'none', vscode.ConfigurationTarget.Global);


    // Act
    await executeAt(Runtime.powershell, command);

    // Assert
    const pollForFileContent = async (filePath: string): Promise<string> => {
      const timeout = 8000;
      const interval = 500;
      const startTime = Date.now();

      while (Date.now() - startTime < timeout) {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          if (content.trim()) {
            return content;
          }
        }
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
      throw new Error(`Timeout: File content not found at ${filePath}`);
    };

    const output = await pollForFileContent(tempFilePath);
    expect(output.trim()).to.equal('PowerShell works!');
    
    await config.update('confirmation', undefined, vscode.ConfigurationTarget.Global);
  });
});
