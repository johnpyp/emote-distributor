import { Constants, DiscordAPIError, Message, Util } from "discord.js";
import _ from "lodash";
import { Cluster } from "../../../entities/Cluster";
import { UserError } from "../../../errors";
import { logger } from "../../../logger";
import { Command } from "../../command";
import { checkPermissions, Permission } from "../../permissions";
import {
  canManageEmoji,
  getEmojiUsage,
  MAX_EMOTE_BYTES,
  parseNewEmoteArgs,
  VALID_EMOTE_REGEX,
} from "../../util";
import { extractImageBuffer } from "../../util/optimize-image";

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

    const { name, url, animated } = await parseNewEmoteArgs(message, args);

    const isValidName = VALID_EMOTE_REGEX.test(name);
    if (!isValidName) {
      throw new UserError(
        "Emote name is formatted incorrectly: only letters, numbers, and underscores are allowed ❌"
      );
    }

    if (name.length > 32) {
      throw new UserError("Emote name cannot be longer than 32 characters");
    }

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

    const resizedImage = await extractImageBuffer(url);

    if (resizedImage && resizedImage.buf.byteLength > MAX_EMOTE_BYTES) {
      throw new UserError("Emote is too large (max 256kb)");
    }

    try {
      const emoji = await lowestUsage.guild.emojis.create(resizedImage?.buf || url, name);

      return await message.reply(
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
  }
}
