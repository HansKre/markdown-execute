import { expect } from 'chai';
import { escapeForShell } from '../../executeAt';

suite('Shell Escaping Tests', () => {
  test('Should escape double quotes', () => {
    const input = 'console.log("hello")';
    const expected = 'console.log(\\"hello\\")';
    expect(escapeForShell(input)).to.equal(expected);
  });

  test('Should escape backticks', () => {
    const input = 'console.log(`hello`)';
    const expected = 'console.log(\\`hello\\`)';
    expect(escapeForShell(input)).to.equal(expected);
  });

  test('Should escape dollar signs', () => {
    const input = 'echo $PATH';
    const expected = 'echo \\$PATH';
    expect(escapeForShell(input)).to.equal(expected);
  });

  test('Should escape backslashes', () => {
    const input = 'path\\to\\file';
    const expected = 'path\\\\to\\\\file';
    expect(escapeForShell(input)).to.equal(expected);
  });

  test('Should handle multiple special characters - JS example', () => {
    const input = `let i = 12;
console.log("ab$cd");
console.log("ab$$cd");
console.log("sdfdsgdfg");
console.log(\`ab\${i}cd\`);
console.log(\`three spaces   in a row\`);`;

    const result = escapeForShell(input);

    // Should escape all $, ", `, and \ characters
    expect(result).to.include('\\"ab\\$cd\\"');
    expect(result).to.include('\\"ab\\$\\$cd\\"');
    expect(result).to.include('\\`ab\\${i}cd\\`');
  });

  test('Should handle template literals with variables', () => {
    const input = '`ab${i}cd`';
    const expected = '\\`ab\\${i}cd\\`';
    expect(escapeForShell(input)).to.equal(expected);
  });

  test('Should preserve spaces', () => {
    const input = 'three spaces   in a row';
    const expected = 'three spaces   in a row';
    expect(escapeForShell(input)).to.equal(expected);
  });

  test('Should handle empty string', () => {
    expect(escapeForShell('')).to.equal('');
  });

  test('Should handle string with no special characters', () => {
    const input = 'console.log(hello)';
    expect(escapeForShell(input)).to.equal(input);
  });

  test('Should handle Python strings', () => {
    const input = 'print("it works")';
    const expected = 'print(\\"it works\\")';
    expect(escapeForShell(input)).to.equal(expected);
  });

  test('Should handle Python f-strings', () => {
    const input = 'print(f\'Hello {name}\')';
    const expected = 'print(f\'Hello {name}\')';
    expect(escapeForShell(input)).to.equal(expected);
  });

  test('Should preserve multi-line strings with indentation', () => {
    const input = `echo "services:
  caddy:
    image: caddy:alpine
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile"`;

    const result = escapeForShell(input);

    // Should preserve the newlines and spaces
    expect(result).to.include('services:');
    expect(result).to.include('  caddy:');
    expect(result).to.include('    image: caddy:alpine');
    expect(result).to.include('      - ./Caddyfile:/etc/caddy/Caddyfile');
  });
});
