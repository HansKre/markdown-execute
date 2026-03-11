/* eslint-disable @typescript-eslint/naming-convention */
const SHELL_ESCAPE_REPLACEMENTS: { [key: string]: string } = {
  '"': '\\"',
  "`": "\\`",
  $: "\\$",
  "\\": "\\\\",
  "!": "\\!",
};
/* eslint-enable @typescript-eslint/naming-convention */

export function escapeForShell(inputString: string): string {
  return inputString.replace(
    /[\\"`$!]/g,
    (match) => SHELL_ESCAPE_REPLACEMENTS[match],
  );
}

export function escapeForPowershellWindows(inputString: string): string {
  return inputString.replace(/"/g, '`"');
}

export function escapeForPowershellUnix(inputString: string): string {
  return inputString.replace(/'/g, "'\"'\"'");
}
