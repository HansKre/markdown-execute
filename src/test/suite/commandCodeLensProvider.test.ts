import { expect } from 'chai';
import * as vscode from 'vscode';
import { CommandCodeLensProvider } from '../../commandCodeLensProvider';
import { Runtime } from '../../types/types';

suite('CommandCodeLensProvider Tests', () => {
  let provider: CommandCodeLensProvider;

  setup(() => {
    provider = new CommandCodeLensProvider();
  });

  test('Should provide CodeLens for shell script', () => {
    const content = `# Test
\`\`\`sh
echo "hello"
\`\`\`
`;
    const document = createMockDocument(content);
    const codeLenses = provider.provideCodeLenses(document, null as any) as vscode.CodeLens[];

    expect(codeLenses).to.have.lengthOf(1);
    expect(codeLenses[0].command?.title).to.include('Shell-Script');
    expect(codeLenses[0].command?.arguments?.[0].runtime).to.equal(Runtime.shell);
    expect(codeLenses[0].command?.arguments?.[0].command).to.equal('echo "hello"');
  });

  test('Should provide CodeLens for bash script', () => {
    const content = `# Test
\`\`\`bash
export VAR=value
echo $VAR
\`\`\`
`;
    const document = createMockDocument(content);
    const codeLenses = provider.provideCodeLenses(document, null as any) as vscode.CodeLens[];

    expect(codeLenses).to.have.lengthOf(1);
    expect(codeLenses[0].command?.title).to.include('Shell-Script');
    expect(codeLenses[0].command?.arguments?.[0].runtime).to.equal(Runtime.shell);
  });

  test('Should provide CodeLens for JavaScript', () => {
    const content = `# Test
\`\`\`js
console.log("hello");
\`\`\`
`;
    const document = createMockDocument(content);
    const codeLenses = provider.provideCodeLenses(document, null as any) as vscode.CodeLens[];

    expect(codeLenses).to.have.lengthOf(1);
    expect(codeLenses[0].command?.title).to.include('NodeJs-Script');
    expect(codeLenses[0].command?.arguments?.[0].runtime).to.equal(Runtime.nodeJs);
    expect(codeLenses[0].command?.arguments?.[0].command).to.equal('console.log("hello");');
  });

  test('Should provide CodeLens for Python', () => {
    const content = `# Test
\`\`\`python
print("hello")
\`\`\`
`;
    const document = createMockDocument(content);
    const codeLenses = provider.provideCodeLenses(document, null as any) as vscode.CodeLens[];

    expect(codeLenses).to.have.lengthOf(1);
    expect(codeLenses[0].command?.title).to.include('Python-Script');
    expect(codeLenses[0].command?.arguments?.[0].runtime).to.equal(Runtime.python);
    expect(codeLenses[0].command?.arguments?.[0].command).to.equal('print("hello")');
  });

  test('Should provide CodeLens for TypeScript with ```ts', () => {
    const content = `# Test
\`\`\`ts
console.log("TypeScript works")
\`\`\`
`;
    const document = createMockDocument(content);
    const codeLenses = provider.provideCodeLenses(document, null as any) as vscode.CodeLens[];

    expect(codeLenses).to.have.lengthOf(1);
    expect(codeLenses[0].command?.title).to.include('TypeScript-Script');
    expect(codeLenses[0].command?.arguments?.[0].runtime).to.equal(Runtime.typeScript);
    expect(codeLenses[0].command?.arguments?.[0].command).to.equal('console.log("TypeScript works")');
  });

  test('Should provide CodeLens for TypeScript with ```typescript', () => {
    const content = `# Test
\`\`\`typescript
const greet = (name: string): void => {
  console.log(\`Hello \${name}\`)
}
greet('World')
\`\`\`
`;
    const document = createMockDocument(content);
    const codeLenses = provider.provideCodeLenses(document, null as any) as vscode.CodeLens[];

    expect(codeLenses).to.have.lengthOf(1);
    expect(codeLenses[0].command?.title).to.include('TypeScript-Script');
    expect(codeLenses[0].command?.arguments?.[0].runtime).to.equal(Runtime.typeScript);
  });

  test('Should NOT provide CodeLens for unsupported languages', () => {
    const content = `# Test
\`\`\`json
{ "foo": "bar" }
\`\`\`
`;
    const document = createMockDocument(content);
    const codeLenses = provider.provideCodeLenses(document, null as any) as vscode.CodeLens[];

    expect(codeLenses).to.have.lengthOf(0);
  });

  test('Should handle multiple code blocks', () => {
    const content = `# Test
\`\`\`sh
echo "first"
\`\`\`

Some text

\`\`\`js
console.log("second");
\`\`\`

\`\`\`python
print("third")
\`\`\`

\`\`\`ts
console.log("fourth")
\`\`\`
`;
    const document = createMockDocument(content);
    const codeLenses = provider.provideCodeLenses(document, null as any) as vscode.CodeLens[];

    expect(codeLenses).to.have.lengthOf(4);
  });

  test('Should skip comment lines starting with //', () => {
    const content = `# Test
\`\`\`sh
// This is a comment
echo "hello"
// Another comment
\`\`\`
`;
    const document = createMockDocument(content);
    const codeLenses = provider.provideCodeLenses(document, null as any) as vscode.CodeLens[];

    expect(codeLenses).to.have.lengthOf(1);
    expect(codeLenses[0].command?.arguments?.[0].command).to.equal('echo "hello"');
    expect(codeLenses[0].command?.arguments?.[0].command).to.not.include('//');
  });

  test('Should preserve indentation in code blocks', () => {
    const content = `# Test
\`\`\`python
def say_hello(name):
  print(f'Hello {name}')
say_hello('World')
\`\`\`
`;
    const document = createMockDocument(content);
    const codeLenses = provider.provideCodeLenses(document, null as any) as vscode.CodeLens[];

    expect(codeLenses).to.have.lengthOf(1);
    const command = codeLenses[0].command?.arguments?.[0].command;
    expect(command).to.include('  print'); // Preserves 2-space indent
  });

  test('Should handle multi-line shell scripts', () => {
    const content = `# Test
\`\`\`bash
export jenkins=ec2-3-122-205-211.eu-central-1.compute.amazonaws.com
for i in {1..3}
do
   echo "Foo $i"
done
\`\`\`
`;
    const document = createMockDocument(content);
    const codeLenses = provider.provideCodeLenses(document, null as any) as vscode.CodeLens[];

    expect(codeLenses).to.have.lengthOf(1);
    const command = codeLenses[0].command?.arguments?.[0].command;
    expect(command).to.include('export jenkins');
    expect(command).to.include('for i in');
    expect(command).to.include('done');
  });

  test('Should handle special characters in JavaScript', () => {
    const content = `# Test
\`\`\`js
let i = 12;
console.log("ab$cd");
console.log(\`ab\${i}cd\`);
\`\`\`
`;
    const document = createMockDocument(content);
    const codeLenses = provider.provideCodeLenses(document, null as any) as vscode.CodeLens[];

    expect(codeLenses).to.have.lengthOf(1);
    const command = codeLenses[0].command?.arguments?.[0].command;
    expect(command).to.include('$');
    expect(command).to.include('`');
  });

  test('Should not add line break after last line', () => {
    const content = `# Test
\`\`\`sh
echo "line1"
echo "line2"
\`\`\`
`;
    const document = createMockDocument(content);
    const codeLenses = provider.provideCodeLenses(document, null as any) as vscode.CodeLens[];

    expect(codeLenses).to.have.lengthOf(1);
    const command = codeLenses[0].command?.arguments?.[0].command;
    // Should not end with newline
    expect(command).to.equal('echo "line1"\necho "line2"');
  });
});

// Helper function to create a mock TextDocument
function createMockDocument(content: string): vscode.TextDocument {
  const lines = content.split('\n');

  return {
    getText: () => content,
    uri: vscode.Uri.file('/test.md'),
    fileName: '/test.md',
    isUntitled: false,
    languageId: 'markdown',
    version: 1,
    isDirty: false,
    isClosed: false,
    save: async () => true,
    eol: vscode.EndOfLine.LF,
    lineCount: lines.length,
    lineAt: (lineOrPosition: number | vscode.Position): vscode.TextLine => {
      const lineNumber = typeof lineOrPosition === 'number' ? lineOrPosition : lineOrPosition.line;
      const lineText = lines[lineNumber] || '';
      return {
        lineNumber,
        text: lineText,
        range: new vscode.Range(lineNumber, 0, lineNumber, lineText.length),
        rangeIncludingLineBreak: new vscode.Range(lineNumber, 0, lineNumber, lineText.length),
        firstNonWhitespaceCharacterIndex: lineText.search(/\S/),
        isEmptyOrWhitespace: lineText.trim().length === 0,
      };
    },
    offsetAt: () => 0,
    positionAt: () => new vscode.Position(0, 0),
    validateRange: (range: vscode.Range) => range,
    validatePosition: (position: vscode.Position) => position,
    getWordRangeAtPosition: () => undefined,
  } as any;
}
