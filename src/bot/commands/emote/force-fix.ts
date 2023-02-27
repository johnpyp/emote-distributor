import { Constants, DiscordAPIError, Message, Util } from "discord.js";
import _ from "lodash";
import { Cluster } from "../../../entities/Cluster";
import { ArgsError, UserError } from "../../../errors";
import { logger } from "../../../logger";
import { Command } from "../../command";
import { checkPermissions, Permission } from "../../permissions";
import { canManageEmoji, getEmojiUsage, MAX_EMOTE_BYTES, resolveEmote } from "../../util";
import { extractImageBuffer } from "../../util/optimize-image";

export class EmoteForceFix extends Command {
  constructor() {
    super({
      id: "emote:force-fix",
      aliases: ["emote force-fix"],
      guildOnly: true,
      argsFormat: ["<emote | emote name>"],
      description:
        "Attempt to reinsert an emote where there's space, fixing capacity that was reclaimed after an expired nitro subscription.",
    });
  }

  async exec(message: Message, args: string[]): Promise<unknown> {
    const [nameOrEmote] = args;
    if (!nameOrEmote) throw new ArgsError("No emote or emote name provided ❌");

    const { cluster, role } = await Cluster.getImplicitClusterAndRoleGuard(
      message.guild?.id,
      message.author.id
    );

    const manageEmojisCheck = canManageEmoji(cluster, message.member);

    if (!checkPermissions(role, [Permission.ForceFixEmote]) && !manageEmojisCheck) {
      return message.reply(`Insufficient permissions`);
    }

    const guilds = cluster.getDiscordGuilds(this.client);
    const oldEmoji = await resolveEmote(guilds, nameOrEmote);

    const oldUrl = oldEmoji.url;
    const oldName = oldEmoji.name;

    if (!oldName) throw new UserError("Emoji has no name for some reason?");

    const animated = oldEmoji.animated;

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

    const resizedImage = await extractImageBuffer(oldUrl);

    if (resizedImage && resizedImage.buf.byteLength > MAX_EMOTE_BYTES) {
      throw new UserError("Emote is too large (max 256kb)");
    }

    await message.channel.send(
      `Attempting to create emoji ${oldName} using ${oldUrl}. If this doesn't work, try:\n ` +
        `\`\`\`!emoji remove ${oldName}\n` +
        `!emoji add ${oldName} ${oldUrl}\`\`\``
    );

    try {
      const emoji = await lowestUsage.guild.emojis.create(resizedImage?.buf || oldUrl, oldName);

      await message.channel.send(
        `New emote :${Util.escapeMarkdown(
          emoji.name ?? ""
        )}: added to ${cluster.displayString()}: ${emoji}`
      );
    } catch (error) {
      logger.error("Error adding emoji to guild", error);
      if (error.code === Constants.APIErrors.INVALID_FORM_BODY) {
        const mimeString = resizedImage?.mime ? ` (${resizedImage.mime})` : "";
        throw new UserError(`Emote is too large (max 256kb) or wrong file type${mimeString}`);
      }
      if (error instanceof DiscordAPIError) {
        throw new UserError(`Unknown discord error: ${error.message}`);
      }

      if (error instanceof UserError) {
        throw error;
      }

      throw new UserError("Unknown error");
    }

    try {
      const deletedEmoji = await oldEmoji.delete("Deleted by bot");
      return await message.reply(
        `Deleted previous version of emoji: ${deletedEmoji.name} from ${cluster.displayString()} 💀`
      );
    } catch (error) {
      logger.error("Error deleting emoji from guild during force fix", error);

      if (error instanceof DiscordAPIError) {
        throw new UserError(`Unknown discord error: ${error.message}`);
      }

      throw new UserError("Unknown error");
    }
  }
}
