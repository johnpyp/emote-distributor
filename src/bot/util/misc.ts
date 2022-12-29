import _ from "lodash";
import { Command } from "../command";

export function displayPercentage(decimal: number): string {
  const percNumber = (decimal * 100).toFixed(2);
  return `${percNumber}%`;
}

export function locateClosestPrefixMatch(
  possibleMatches: string[],
  args?: string[]
): string | undefined {
  if (!args || possibleMatches.length <= 1) return;
  let matches = possibleMatches;
  let matchedArgs = 1;
  while (matches.length > 1 && matchedArgs <= args.length) {
    const prefix = args.slice(0, matchedArgs).join(" ");
    const nextMatches = matches.filter((value) => value.startsWith(prefix));
    if (nextMatches.length <= 1 && nextMatches[0]) return nextMatches[0];
    matches = nextMatches;
    matchedArgs += 1;
  }
  return matches[0] ?? undefined;
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

export function formatHelpCommand(command: Command, args?: string[]): string[] | null {
  const closestPrefix = locateClosestPrefixMatch(command.aliases, args);
  const firstAlias = closestPrefix ?? command.aliases[0];
  if (!firstAlias) throw new Error("Command has no alias");
  return formatHelp(firstAlias, command.argsFormat, command.description);
}

export function formatManyHelp(commands: Command[], args?: string[]): string[] {
  const helps = _.uniqBy(commands, (command) => command.id)
    .map((command) => formatHelpCommand(command, args))
    .flatMap((x) => (x ? [...x, ``] : []));
  return helps;
}

export function formatSubcommandHelp(commands: Command[], args?: string[]): string[] | null {
  if (commands.length < 1) return null;
  const helps = formatManyHelp(commands, args);
  return [`Use one of the subcommands:`, ``, ...helps];
}

// 256kb
export const MAX_EMOTE_BYTES = 262_144;
