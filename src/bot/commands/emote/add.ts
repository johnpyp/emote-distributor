import { Message, Util } from "discord.js";
import _ from "lodash";
import { Cluster } from "../../../entities/Cluster";
import { UserError } from "../../../errors";
import { Command } from "../../command";
import { checkPermissions, Permission } from "../../permissions";
import { canManageEmoji, getEmojiUsage, parseNewEmoteArgs, VALID_EMOTE_REGEX } from "../../util";

export class EmoteAdd extends Command {
  constructor() {
    super({
      id: "emote:add",
      aliases: ["emote add"],
      guildOnly: true,
      argsFormat: ["<emote name> <emote | url | attachment>", "<emote>"],
      description:
        "Add an emote to the cluster. Provide a name with a source emote, image/gif url, or attachment image/gif.",
    });
  }

  async exec(message: Message, args: string[]): Promise<unknown> {
    const { cluster, role } = await Cluster.getImplicitClusterAndRoleGuard(
      message.guild?.id,
      message.author.id
    );

    const manageEmojisCheck = canManageEmoji(cluster, message.member);

    if (!checkPermissions(role, [Permission.AddEmote]) && !manageEmojisCheck) {
      return message.reply(`Insufficient permissions`);
    }

    const { name, url, animated } = parseNewEmoteArgs(message, args);

    const isValidName = VALID_EMOTE_REGEX.test(name);
    if (!isValidName)
      return message.reply(
        "Emote name is formatted incorrectly: only letters, numbers, and underscores are allowed ❌"
      );

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

    return message.reply(
      `New emote :${Util.escapeMarkdown(
        emoji.name ?? ""
      )}: added to ${cluster.displayString()}: ${emoji}`
    );
  }
}
