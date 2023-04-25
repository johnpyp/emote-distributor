import { Collection, GuildEmoji, Message, Guild as DiscordGuild } from "discord.js";
import _ from "lodash";
import path from "path";
import invariant from "tiny-invariant";
import { ArgsError, UserError } from "../../errors";
import { logger } from "../../logger";
import { SevenTVApi, SevenTVEmote } from "./7tv-api";

const ALPHA1_REGEX = /^[a-zA-Z0-9]+$/;
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

export async function parseNewEmoteArgs(message: Message, args: string[]): Promise<EmoteData> {
  if (message.attachments.size > 0) {
    const attachment = message.attachments.first();
    invariant(attachment, "First attachment doesn't exist");
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
      return handleParseInputUrl(name, args[1]);
    }
    const url = getEmoteUrl(parsed.id, parsed.animated);

    return { name, url, animated: parsed.animated };
  }

  throw new ArgsError("No emote or name provided ❌");
}

async function handleParseInputUrl(name: string, rawUrl: string): Promise<EmoteData> {
  const unsanitizedUrl = stripAngleBrackets(rawUrl);

  invariant(unsanitizedUrl.length < 1000, "1000-length urls are unreasonable");

  const parsedUrl = new URL(unsanitizedUrl);
  const url = parsedUrl.toString();

  // Handle 7tv case
  if (url.includes("https://7tv.app/emotes/")) {
    const [_none, prefix, emoteId] = parsedUrl.pathname.split("/").map((x) => x.trim());
    console.log({ parsedUrl, pathname: parsedUrl.pathname, prefix, emoteId });
    invariant(prefix === "emotes", "The prefix should always be /emotes/");
    if (!emoteId) throw new UserError("No emote id in given url");
    const isValidEmoteId = ALPHA1_REGEX.test(emoteId);
    if (!isValidEmoteId) throw new UserError("Invalid emote id");

    let fetchedEmote: SevenTVEmote | null;
    try {
      fetchedEmote = await SevenTVApi.getEmote(emoteId);
    } catch (e) {
      logger.error("Error fetching 7tv emote", e);
      throw new UserError("Something went wrong retrieving the 7tv emote");
    }

    if (!fetchedEmote) throw new UserError("Couldn't find given 7tv emote");

    const webpFiles = fetchedEmote.host.files.filter((file) => file.format === "WEBP");

    // Prefer the largest webp image under threshold
    let okSizeEmoteFile = _.maxBy(
      webpFiles.filter((file) => file.size <= 256 * 1024),
      "size"
    );
    if (!okSizeEmoteFile) {
      // If we can't find a suitable emote file to use, get the smallest webp, otherwise get the first one
      okSizeEmoteFile = _.minBy(webpFiles, "size") ?? webpFiles[0];
    }

    invariant(okSizeEmoteFile, "There should be at least one webp emote file available");

    const emoteSizeName = okSizeEmoteFile.name.split(".")[0];
    invariant(emoteSizeName, "Emote size (e.g 4x) should be available once splitting on extension");

    const extensionToUse = fetchedEmote.animated ? ".gif" : ".webp";

    // Example
    // https: + //cdn.7tv.app/emote/612398bac50a1832d0ab846b + / + 4x + (.gif | .webp)
    const imageUrl = new URL(`https:${fetchedEmote.host.url}/${emoteSizeName}${extensionToUse}`);

    logger.info("Using 7tv image url", { imageUrl: imageUrl.toString() });

    return {
      name,
      url: imageUrl.toString(),
      animated: fetchedEmote.animated,
    };
  }

  return {
    name,
    animated: url.endsWith("gif"),
    url,
  };
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
    discordGuild.emojis.cache.filter((emoji) => emoji?.name?.toLowerCase() === name.toLowerCase())
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
const tierBoosts = {
  NONE: 0,
  TIER_1: 50,
  TIER_2: 100,
  TIER_3: 200,
} as const;
export function getEmojiUsage(discordGuild: DiscordGuild): EmojiUsage {
  const animatedLimit = 50;
  const staticBoost =
    discordGuild.premiumTier in tierBoosts ? tierBoosts[discordGuild.premiumTier] : 0;
  const staticLimit = staticBoost + 50;

  const animatedCount = discordGuild.emojis.cache.filter((emoji) => emoji.animated ?? false).size;
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
