import { Client, GuildMember, Permissions, User as DiscordUser } from "discord.js";
import { Cluster } from "../../entities/Cluster";

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

export function canManageEmoji(cluster: Cluster, member: GuildMember | null) {
  if (!member) return false;

  return (
    cluster.emoteManagersCanModerate &&
    member.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)
  );
}
