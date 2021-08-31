import { Message, Util, Permissions } from "discord.js";
import _ from "lodash";
import { Cluster } from "../../../entities/Cluster";
import { ArgsError } from "../../../errors";
import { logger } from "../../../logger";
import { Command } from "../../command";
import { checkPermissions, Permission } from "../../permissions";
import { canManageEmoji, resolveEmote, VALID_EMOTE_REGEX } from "../../util";

export class EmoteRename extends Command {
  constructor() {
    super({
      id: "emote:rename",
      aliases: ["emote rename"],
      guildOnly: true,
      argsFormat: ["<emote | emote name> <new emote name>"],
      description: "Rename a given emote or emote name in the cluster to a new name.",
    });
  }

  async exec(message: Message, args: string[]): Promise<unknown> {
    const [targetEmoteName, newEmoteName] = args;
    if (!targetEmoteName) throw new ArgsError("No emote or emote name provided ❌");
    if (!newEmoteName) throw new ArgsError("No new emote name provided ❌");

    const { cluster, role } = await Cluster.getImplicitClusterAndRoleGuard(
      message.guild?.id,
      message.author.id
    );

    const manageEmojisCheck = canManageEmoji(cluster, message.member);

    if (!checkPermissions(role, [Permission.RenameEmote]) && !manageEmojisCheck) {
      return message.reply(`Insufficient permissions`);
    }

    const guilds = cluster.getDiscordGuilds(this.client);

    const targetEmote = await resolveEmote(guilds, targetEmoteName);
    const oldName = targetEmote.name;

    const cleanNewName = _.trim(newEmoteName, ":");
    const isValidName = VALID_EMOTE_REGEX.test(cleanNewName);
    if (!isValidName)
      return message.reply(
        "Emote name is formatted incorrectly: only letters, numbers, and underscores are allowed ❌"
      );

    try {
      await targetEmote.edit({ name: cleanNewName }, "Renamed by bot");
      return await message.reply(
        `Renamed :${Util.escapeMarkdown(oldName || "")}: to :${Util.escapeMarkdown(
          cleanNewName
        )}: in ${cluster.displayString()}: ${targetEmote}`
      );
    } catch (e) {
      logger.error("Error renaming emote", e);
      return message.reply(`Emote name rejected by discord, check formatting ❌`);
    }
  }
}
