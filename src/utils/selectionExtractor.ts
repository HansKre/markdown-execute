import * as vscode from 'vscode';
import { Runtime, detectRuntime } from '../types/types';

interface SelectionResult {
  text: string;
  runtime: Runtime | null;
}

function isCommentLine(line: string): boolean {
  return line.startsWith('//');
}

function addLineToSelection(line: string, start: number, end: number): string {
  const selection = line.substring(start, end).trim();
  if (selection && !isCommentLine(selection)) {
    return selection + '\n';
  }
  return '';
}

function extractFromOpeningFence(
  documentLines: string[],
  cursorLine: number,
  runtime: Runtime
): SelectionResult {
  let text = '';
  let lineIndex = cursorLine + 1;

  while (lineIndex < documentLines.length) {
    const line = documentLines[lineIndex];
    if (line.trim() === '```') {
      break;
    }
    text += addLineToSelection(line.trim(), 0, line.length);
    lineIndex++;
  }

  return { text, runtime };
}

function extractFromClosingFence(
  documentLines: string[],
  cursorLine: number
): SelectionResult {
  if (cursorLine < 2) {
    return { text: '', runtime: null };
  }

  let text = '';
  let runtime: Runtime | null = null;
  let lineIndex = cursorLine - 1;

  while (lineIndex >= 0) {
    const line = documentLines[lineIndex];
    runtime = detectRuntime(line.trim());

    if (runtime) {
      text = text.split('\n').reverse().join('\n');
      break;
    }

    text += addLineToSelection(line.trim(), 0, line.length);
    lineIndex--;
  }

  return { text, runtime };
}

function extractSingleLineAndFindRuntime(
  documentLines: string[],
  cursorLine: number
): SelectionResult {
  const text = documentLines[cursorLine].trim();
  let runtime: Runtime | null = null;
  let lineIndex = cursorLine;

  while (lineIndex >= 0 && !runtime) {
    runtime = detectRuntime(documentLines[lineIndex].trim());
    lineIndex--;
  }

  return { text, runtime };
}

function extractFromMultiLineSelection(
  documentLines: string[],
  selection: vscode.Selection
): string {
  let text = '';

  for (let i = selection.start.line; i <= selection.end.line; i++) {
    const line = documentLines[i];

    if (selection.start.line === selection.end.line) {
      text += addLineToSelection(line, selection.start.character, selection.end.character);
    } else if (i === selection.start.line) {
      text += addLineToSelection(line, selection.start.character, line.length);
    } else if (i === selection.end.line) {
      text += addLineToSelection(line, 0, selection.end.character);
    } else {
      text += addLineToSelection(line, 0, line.length);
    }
  }

  return text;
}

export function extractSelectionFromEditor(editor: vscode.TextEditor): SelectionResult {
  const documentLines = editor.document.getText().split('\n');
  const selection = editor.selection;

  if (selection.isEmpty) {
    const cursorLine = selection.start.line;
    const lineAtCursor = documentLines[cursorLine];
    const runtime = detectRuntime(lineAtCursor.trim());

    if (runtime) {
      return extractFromOpeningFence(documentLines, cursorLine, runtime);
    } else if (lineAtCursor.trim().startsWith('```')) {
      return extractFromClosingFence(documentLines, cursorLine);
    } else {
      return extractSingleLineAndFindRuntime(documentLines, cursorLine);
    }
  } else {
    const text = extractFromMultiLineSelection(documentLines, selection);
    return { text, runtime: null };
  }
}

export function removeTrailingNewline(text: string): string {
  return text.endsWith('\n') ? text.substring(0, text.length - 1) : text;
}
