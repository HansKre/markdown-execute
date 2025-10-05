import { exec } from '../extension';
import { hasOwnProperties } from 'ts-type-safe';

type RuntimeExecutable = 'none' | string;

export async function detectExecutable(
  executables: string[]
): Promise<RuntimeExecutable> {
  for (const executable of executables) {
    try {
      await exec(`${executable} --version`);
      return executable;
    } catch (err) {
      if (
        hasOwnProperties(err, ['code', 'stderr']) &&
        typeof err.stderr === 'string' &&
        err.stderr.includes('command not found')
      ) {
        console.error(err.stderr);
      }
    }
  }
  return 'none';
}
