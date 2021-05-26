import { Message } from "discord.js";
import _ from "lodash";
import { Cluster } from "../../../entities/Cluster";
import { Command } from "../../command";
import { checkPermissions, Permission } from "../../permissions";
import { getEmojiUsage, parseEmoteData, UserError } from "../../util";

export class EmoteAdd extends Command {
  constructor(id: string) {
    super(id, { aliases: [], guildOnly: true });
  }

  async exec(message: Message, args: string[]): Promise<unknown> {
    const { cluster, role } = await Cluster.getImplicitClusterAndRoleGuard(
      message.guild?.id,
      message.author.id
    );

    const manageEmojisCheck =
      cluster.emoteManagersCanModerate && message.member?.hasPermission(["MANAGE_EMOJIS"]);

    if (!checkPermissions(role, [Permission.AddEmote]) && !manageEmojisCheck) {
      return message.reply(`Insufficient permissions`);
    }

    const { name, url, animated } = parseEmoteData(message, args);

    const guilds = cluster.getDiscordGuilds(this.client);

    const nonFullGuilds = guilds
      .map((guild) => getEmojiUsage(guild))
      .filter((usage) => {
        if (animated) return !usage.animatedFull;
        return !usage.staticFull;
      });
    const lowestUsage = _.minBy(nonFullGuilds, (usage) =>
      animated ? usage.animatedPerc : usage.staticPerc
    );
    if (!lowestUsage) throw new UserError("All guilds are full");

    const emoji = await lowestUsage.guild.emojis.create(url, name);

    return message.reply(`New emote :${emoji.name}: added to ${cluster.displayString()}: ${emoji}`);
  }
}
