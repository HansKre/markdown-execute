const SHELL_ESCAPE_REPLACEMENTS: { [key: string]: string } = {
  '"': '\\"',
  "`": "\\`",
  $: "\\$",
  "\\": "\\\\",
};

export function escapeForShell(inputString: string): string {
  return inputString.replace(
    /[\\"`$]/g,
    (match) => SHELL_ESCAPE_REPLACEMENTS[match]
  );
}
