import { exec } from "../extension";

type RuntimeExecutable = "none" | string;

export interface ExecutableCandidate {
  executable: string;
  versionFlag: string;
}

export function getPowershellCandidates(): ExecutableCandidate[] {
  const isWindows = process.platform === "win32";
  return isWindows
    ? [
        { executable: "pwsh", versionFlag: "--version" },
        { executable: "powershell.exe", versionFlag: "-Command Get-Date" },
      ]
    : [
        { executable: "pwsh", versionFlag: "--version" },
        { executable: "pwsh-lts", versionFlag: "--version" },
      ];
}

export async function detectExecutable(
  candidates: string[] | ExecutableCandidate[],
): Promise<RuntimeExecutable> {
  const normalized: ExecutableCandidate[] =
    typeof candidates[0] === "string"
      ? (candidates as string[]).map((e) => ({
          executable: e,
          versionFlag: "--version",
        }))
      : (candidates as ExecutableCandidate[]);

  for (const { executable, versionFlag } of normalized) {
    try {
      await exec(`${executable} ${versionFlag}`);
      return executable;
    } catch {
      // executable not found, try next candidate
    }
  }
  return "none";
}
