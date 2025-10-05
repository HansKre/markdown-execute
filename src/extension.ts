// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
// promisify cp.exec
const util = require("util");
export const exec = util.promisify(require("child_process").exec);
import { CommandCodeLensProvider } from "./commandCodeLensProvider";
import { executeAt } from "./executeAt";
import { Runtime, detectRuntime } from "./types/types";

const DEBUG_OUT = false;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "markdown-execute.execute",
      async (args) => {
        if (!args?.runtime) {
          vscode.window.showInformationMessage("No runtime selected.");
          return;
        }
        if (!args?.command) {
          vscode.window.showInformationMessage(
            "Empty command, nothing to execute."
          );
          return;
        }
        const config = vscode.workspace.getConfiguration("markdown-execute");
        const confirmation = config.get<Confirmation>("confirmation", "none");

        if (confirmation !== "none") {
          const userChoice = await getUserChoice(confirmation);
          if (userChoice !== "Execute") {
            vscode.window.showInformationMessage("Execution cancelled.");
            return;
          }
        }

        executeAt(args.runtime, args.command);
      }
    )
  );
  // Add the command to markdown files
  const codeLensProvider = new CommandCodeLensProvider();
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      { language: "markdown", scheme: "file" },
      codeLensProvider
    )
  );
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      { language: "markdown", scheme: "untitled" },
      codeLensProvider
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "markdown-execute.executeSelection",
      async () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
          vscode.window.showInformationMessage(
            "Could not detect an active editor."
          );
          return;
        }

        const documentLines = activeEditor.document.getText().split("\n");
        let selectedText = "";
        let runtime: Runtime | null = null;

        if (activeEditor.selection.isEmpty) {
          /**
           * find nearest code-block
           *  3x cases:
           *    1. cursor is at ```[js|sh]
           *       -> go down to ``` and select everything inbetween
           *    2. cursor is at ```
           *       -> go up to ```[js|sh] and select everything inbetween
           *    3. cursor is somewhere inbetween
           *        2x possible approaches, either:
           *          -> needs to go up AND down -> combine 1. and 2.
           *            -> abort if hits ``` while going up
           *            -> abort if hits ```[js|sh] while going down
           *        or:
           *          -> execute only the one line at cursor
           *          for the sake of simplicity, choosing this one
           */
          const lineAtCursor = documentLines[activeEditor.selection.start.line];
          runtime = detectRuntime(lineAtCursor.trim());
          if (runtime) {
            // case 1
            DEBUG_OUT && console.log("case 1");
            // start one line after ```[js|sh] and go down
            let i = activeEditor.selection.start.line + 1;
            let reachedEnd = false;
            do {
              if (documentLines[i].trim() === "```") {
                reachedEnd = true;
                continue;
              }
              selectedText += newSelection(
                documentLines[i].trim(),
                0,
                documentLines[i].length
              );
              i++;
            } while (i >= 0 && !reachedEnd);
          } else if (lineAtCursor.trim().startsWith("```")) {
            // case 2
            DEBUG_OUT && console.log("case 2");
            // needs to have at least 2 lines above for valid code-block
            if (activeEditor.selection.start.line < 2) {
              return;
            }
            // start one line before ``` and go up
            let i = activeEditor.selection.start.line - 1;
            let reachedEnd = false;
            do {
              runtime = detectRuntime(documentLines[i].trim());
              if (runtime) {
                reachedEnd = true;
                // reverse lines
                selectedText = selectedText.split("\n").reverse().join("\n");
                continue;
              }
              selectedText += newSelection(
                documentLines[i].trim(),
                0,
                documentLines[i].length
              );
              DEBUG_OUT && console.log(i, selectedText);
              i--;
            } while (i >= 0 && !reachedEnd);
          } else {
            // case 3
            DEBUG_OUT && console.log("case 3");
            DEBUG_OUT &&
              console.log(
                documentLines[activeEditor.selection.start.line].trim()
              );
            selectedText =
              documentLines[activeEditor.selection.start.line].trim();
            // go up and try find runtime
            let i = activeEditor.selection.start.line;
            let reachedEnd = false;
            do {
              runtime = detectRuntime(documentLines[i].trim());
              if (runtime) {
                reachedEnd = true;
                continue;
              }
              i--;
            } while (i >= 0 && !reachedEnd);
          }
        } else {
          // extract document-content from selection-meta-data (start/end)
          for (
            let i = activeEditor.selection.start.line;
            i <= activeEditor.selection.end.line;
            i++
          ) {
            // exactly one line selected
            if (
              activeEditor.selection.start.line ===
              activeEditor.selection.end.line
            ) {
              selectedText += newSelection(
                documentLines[i],
                activeEditor.selection.start.character,
                activeEditor.selection.end.character
              );
              continue;
            }
            // multiple lines selected: first line
            if (i === activeEditor.selection.start.line) {
              selectedText += newSelection(
                documentLines[i],
                activeEditor.selection.start.character,
                documentLines[i].length
              );
              continue;
            }
            // multiple lines selected: last line
            if (i === activeEditor.selection.end.line) {
              selectedText += newSelection(
                documentLines[i],
                0,
                activeEditor.selection.end.character
              );
              continue;
            }
            // multiple lines selected: lines in between
            selectedText += newSelection(
              documentLines[i],
              0,
              documentLines[i].length
            );
          }
        }

        // remove the last line break
        if (selectedText.endsWith("\n")) {
          selectedText = selectedText.substring(0, selectedText.length - 1);
        }

        if (!selectedText) {
          vscode.window.showInformationMessage("Nothing selected");
          return;
        }

        let options: vscode.InputBoxOptions = {
          prompt: "Select runtime: ",
          placeHolder: "(execution runtime)",
        };

        if (!runtime) {
          runtime = (await vscode.window.showQuickPick(
            Object.values(Runtime),
            options
          )) as Runtime;
        }

        executeAt(runtime, selectedText);
      }
    )
  );
}

function newSelection(line: string, start: number, stop: number) {
  const selection = line.substring(start, stop).trim();
  if (selection && !selection.startsWith("//")) {
    return selection + "\n";
  }
  return "";
}

// this method is called when your extension is deactivated
export function deactivate() {}

// keep in sync with package.json > "markdown-execute.confirmation" > enum
type Confirmation = "none" | "pick" | "message" | "modal";

async function getUserChoice(mode: Exclude<Confirmation, "none">) {
  switch (mode) {
    case "pick":
      return vscode.window.showQuickPick(["Execute", "Cancel"], {
        placeHolder: "Execute this code block in the terminal?",
        ignoreFocusOut: true,
      });

    case "message":
      return vscode.window.showInformationMessage(
        "Execute this code block in the terminal?",
        "Execute",
        "Cancel"
      );

    case "modal":
      return vscode.window.showInformationMessage(
        "Execute this code block in the terminal?",
        { modal: true },
        "Execute"
      );
  }
}
