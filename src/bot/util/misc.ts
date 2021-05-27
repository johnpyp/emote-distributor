import { Command } from "../command";

export function displayPercentage(decimal: number): string {
  const percNumber = (decimal * 100).toFixed(2);
  return `${percNumber}%`;
}

export function formatHelp(
  commandString: string,
  possibleArgs: string[] | undefined,
  description: string | undefined
): string[] | null {
  if (!possibleArgs || !description) return null;

  let combinedLines = possibleArgs.map((argString) => `${commandString} ${argString}`);
  if (combinedLines.length < 1) combinedLines = [`${commandString}`];
  const [first, ...rest] = combinedLines;

  return [`${first} - ${description}`, ...rest];
}

export function formatHelpCommand(command: Command): string[] | null {
  const firstAlias = command.aliases[0];
  if (!firstAlias) throw new Error("Command has no alias");
  return formatHelp(firstAlias, command.argsFormat, command.description);
}

export function formatManyHelp(commands: Command[]): string[] {
  const helps = commands.map((command) => formatHelpCommand(command)).flatMap((x) => x ?? []);
  return helps;
}

export function formatSubcommandHelp(commands: Command[]): string[] | null {
  if (commands.length < 1) return null;
  const helps = formatManyHelp(commands);
  return [`Use one of the subcommands:`, ``, ...helps];
}
