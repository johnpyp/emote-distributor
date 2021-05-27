import { Client, User as DiscordUser } from "discord.js";

export function getUserFromMention(client: Client, arg: string): DiscordUser | null {
  if (!arg) return null;

  let mention = arg;
  if (arg.startsWith("<@") && arg.endsWith(">")) {
    mention = mention.slice(2, -1);

    if (mention.startsWith("!")) {
      mention = mention.slice(1);
    }

    return client.users.cache.get(mention) ?? null;
  }
  return null;
}
