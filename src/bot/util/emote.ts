import { Collection, GuildEmoji, Message, Guild as DiscordGuild } from "discord.js";
import _ from "lodash";
import path from "path";
import { ArgsError, UserError } from "./errors";

export const VALID_EMOTE_REGEX = /^[a-zA-Z0-9_]{2,}$/;
export const EMOTE_REGEX = /(:|;)(?<name>\w{2,32})\1|(?<newline>\n)/g;

export const CUSTOM_EMOTE_REGEX = /<(?<animated>a?):(?<name>\w{2,32}):(?<id>\d{17,})>/g;

export function getEmoteUrl(id: string, animated = false): string {
  const extension = animated ? "gif" : "png";
  return `https://cdn.discordapp.com/emojis/${id}.${extension}?v=1`;
}
export function formatEmoteFilename(name: string | null): string {
  if (!name) throw new UserError("Error parsing filename");
  const withoutExt = path.parse(name).name;
  if (!withoutExt) throw new UserError("Error parsing filename");
  const split = withoutExt.split("-");
  const left = split.slice(0, -1).join("-");
  const right = split.slice(-1)[0];
  return (left || right).replace(" ", "");
  // left, sep, right = posixpath.splitext(filename)[0].rpartition('-')
  // return (left or right).replace(' ', '')
}

function stripAngleBrackets(str: string): string {
  if (str.startsWith("<") && str.endsWith(">")) return str.slice(1, -1);
  return str;
}

export function parseCustomEmoji(emojiString: string): ParsedCustomEmoji | null {
  const match = [...emojiString.matchAll(CUSTOM_EMOTE_REGEX)][0];
  if (!match) return null;
  const [_fullMatch, animated, name, id] = match;
  return {
    animated: !!animated,
    name,
    id,
  };
}

export interface EmoteData {
  name: string;
  url: string;
  animated: boolean;
}
export function parseNewEmoteArgs(message: Message, args: string[]): EmoteData {
  if (message.attachments.size > 0) {
    const attachment = message.attachments.first();
    if (!attachment) throw new Error("First attachment doesn't exist");
    const name = formatEmoteFilename(args.length > 0 ? args.join("") : attachment.name);
    return {
      name,
      url: attachment.url,
      animated: attachment.proxyURL.endsWith("gif"),
    };
  }

  if (args.length === 1) {
    const parsedCustom = parseCustomEmoji(args[0]);
    if (!parsedCustom) throw new UserError("Error parsing emote name");
    const url = getEmoteUrl(parsedCustom.id, parsedCustom.animated);
    return { name: parsedCustom.name, url, animated: parsedCustom.animated };
  }

  if (args.length >= 2) {
    const name = args[0];
    const parsed = parseCustomEmoji(args[1]);

    if (!parsed) {
      const url = stripAngleBrackets(args[1]);
      return {
        name,
        animated: url.endsWith("gif"),
        url,
      };
    }
    const url = getEmoteUrl(parsed.id, parsed.animated);

    return { name, url, animated: parsed.animated };
  }

  throw new ArgsError("No emote or name provided ❌");
}

export interface ParsedCustomEmoji {
  animated: boolean;
  name: string;
  id: string;
}

export async function resolveEmote(
  discordGuilds: Collection<string, DiscordGuild>,
  nameOrEmote: string
): Promise<GuildEmoji> {
  const parsedCustom = parseCustomEmoji(nameOrEmote);
  if (parsedCustom) {
    for (const discordGuild of discordGuilds.values()) {
      const emote = discordGuild.emojis.resolve(parsedCustom.id);
      if (emote) return emote;
    }
  }

  const name = _.trim(nameOrEmote, ":");
  const possibleEmotes = discordGuilds.flatMap((discordGuild) =>
    discordGuild.emojis.cache.filter((emoji) => emoji.name.toLowerCase() === name.toLowerCase())
  );

  if (possibleEmotes && possibleEmotes.size >= 1) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return possibleEmotes.first()!;
  }
  throw new UserError("Emote not found");
}

export function cleanEmoteName(name: string): string {
  return _.trim(name, ":");
}

export interface EmojiUsage {
  guild: DiscordGuild;
  animated: number;
  animatedLimit: number;
  animatedPerc: number;
  animatedFull: boolean;

  static: number;
  staticLimit: number;
  staticPerc: number;
  staticFull: boolean;

  total: number;
  totalLimit: number;
  totalPerc: number;
  totalFull: boolean;
}
const tierBoosts: Record<number, number> = {
  0: 0,
  1: 50,
  2: 100,
  3: 200,
};
export function getEmojiUsage(discordGuild: DiscordGuild): EmojiUsage {
  const animatedLimit = 50;
  const staticBoost =
    discordGuild.premiumTier in tierBoosts ? tierBoosts[discordGuild.premiumTier] : 0;
  const staticLimit = staticBoost + 50;

  const animatedCount = discordGuild.emojis.cache.filter((emoji) => emoji.animated).size;
  const staticCount = discordGuild.emojis.cache.filter((emoji) => !emoji.animated).size;
  return {
    guild: discordGuild,
    animated: animatedCount,
    animatedLimit,
    animatedPerc: animatedCount / animatedLimit,
    animatedFull: animatedCount >= animatedLimit,
    static: staticCount,
    staticLimit,
    staticPerc: staticCount / staticLimit,
    staticFull: staticCount >= staticLimit,
    total: animatedCount + staticCount,
    totalLimit: animatedLimit + staticLimit,
    totalPerc: (animatedCount + staticCount) / (staticLimit + animatedLimit),
    totalFull: animatedCount + staticCount >= staticLimit + animatedLimit,
  };
}
