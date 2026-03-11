import * as vscode from "vscode";
import { execute } from "./execute";
import { Runtime } from "./types/types";
import {
  detectExecutable,
  getPowershellCandidates,
  type ExecutableCandidate,
} from "./utils/runtimeDetector";
import { escapeForShell } from "./utils/shellEscape";

export async function executeAt(
  runtime: string | undefined,
  selectedText: string,
): Promise<void> {
  switch (runtime) {
    case Runtime.shell:
      await execute(selectedText);
      break;

    case Runtime.nodeJs:
      await execute(`node -e "${escapeForShell(selectedText)}"`);
      break;

    case Runtime.python:
      await executePythonCode(selectedText);
      break;

    case Runtime.typeScript:
      await executeTypeScriptCode(selectedText);
      break;

    case Runtime.powershell:
      await executePowershellCode(selectedText);
      break;
  }
}

async function executePythonCode(code: string): Promise<void> {
  const python = await detectExecutable(["python", "python3"]);

  if (python === "none") {
    vscode.window.showInformationMessage(
      "Unable to find python or python3. Is it installed?",
    );
    return;
  }

  await execute(`${python} -c "${escapeForShell(code)}"`);
}

async function executeTypeScriptCode(code: string): Promise<void> {
  const tsRuntime = await detectExecutable(["tsx", "ts-node"]);

  if (tsRuntime === "none") {
    vscode.window.showInformationMessage(
      "Unable to find tsx or ts-node. Is it installed?",
    );
    return;
  }

  if (tsRuntime === "tsx") {
    await execute(`tsx -e "${escapeForShell(code)}"`);
  } else {
    const tsNodeFlags = `--transpile-only --compiler-options '{"module":"commonjs","moduleResolution":"node"}'`;
    await execute(`ts-node ${tsNodeFlags} -e "${escapeForShell(code)}"`);
  }
}

async function executePowershellCode(code: string): Promise<void> {
  const candidates = getPowershellCandidates();
  const powershell = await detectExecutable(candidates);

  if (powershell === "none") {
    const names = candidates
      .map((c: ExecutableCandidate) => c.executable)
      .join(" or ");
    vscode.window.showInformationMessage(
      `Unable to find ${names}. Is PowerShell installed and added to your PATH?`,
    );
    return;
  }

  await execute(`${powershell} -Command "${escapeForShell(code)}"`);
}
