import * as vscode from "vscode";
import { promisify } from "util";
import { exec as execCb } from "child_process";

export const exec = promisify(execCb);

import { CommandCodeLensProvider } from "./commandCodeLensProvider";
import { executeAt } from "./executeAt";
import { Runtime } from "./types/types";
import { extractSelectionFromEditor, removeTrailingNewline } from "./utils/selectionExtractor";

export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "markdown-execute.execute",
      handleExecuteCommand
    )
  );

  const codeLensProvider = new CommandCodeLensProvider();
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      { language: "markdown", scheme: "file" },
      codeLensProvider
    ),
    vscode.languages.registerCodeLensProvider(
      { language: "markdown", scheme: "untitled" },
      codeLensProvider
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "markdown-execute.executeSelection",
      handleExecuteSelectionCommand
    )
  );
}

async function handleExecuteCommand(args: any): Promise<void> {
  if (!args?.runtime) {
    vscode.window.showInformationMessage("No runtime selected.");
    return;
  }

  if (!args?.command) {
    vscode.window.showInformationMessage("Empty command, nothing to execute.");
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

  await executeAt(args.runtime, args.command);
}

async function handleExecuteSelectionCommand(): Promise<void> {
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    vscode.window.showInformationMessage("Could not detect an active editor.");
    return;
  }

  const selection = extractSelectionFromEditor(activeEditor);
  let selectedText = removeTrailingNewline(selection.text);

  if (!selectedText) {
    vscode.window.showInformationMessage("Nothing selected");
    return;
  }

  let runtime = selection.runtime;

  if (!runtime) {
    const selected = await vscode.window.showQuickPick(Object.values(Runtime), {
      placeHolder: "Select runtime for execution",
    });

    if (!selected) {
      return;
    }

    runtime = selected as Runtime;
  }

  await executeAt(runtime, selectedText);
}

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
