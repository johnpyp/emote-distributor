import { Message, Util } from "discord.js";
import _ from "lodash";
import { Cluster } from "../../../entities/Cluster";
import { logger } from "../../../logger";
import { Command } from "../../command";
import { checkPermissions, Permission } from "../../permissions";
import { resolveEmote, VALID_EMOTE_REGEX } from "../../util";

export class EmoteRename extends Command {
  constructor(id: string) {
    super(id, { aliases: [], guildOnly: true });
  }

  async exec(message: Message, args: string[]): Promise<unknown> {
    const [targetEmoteName, emoteName] = args;
    const { cluster, role } = await Cluster.getImplicitClusterAndRoleGuard(
      message.guild?.id,
      message.author.id
    );

    const manageEmojisCheck =
      cluster.emoteManagersCanModerate && message.member?.hasPermission(["MANAGE_EMOJIS"]);

    if (!checkPermissions(role, [Permission.RenameEmote]) && !manageEmojisCheck) {
      return message.reply(`Insufficient permissions`);
    }

    const guilds = cluster.getDiscordGuilds(this.client);

    const targetEmote = await resolveEmote(guilds, targetEmoteName);
    const oldName = targetEmote.name;

    const newName = _.trim(emoteName, ":");
    const isValidName = VALID_EMOTE_REGEX.test(newName);
    if (!isValidName)
      return message.reply(
        "Emote name is formatted incorrectly: only letters, numbers, and underscores are allowed ❌"
      );

    try {
      await targetEmote.edit({ name: newName }, "Renamed by bot");
      return await message.reply(
        `Renamed :${Util.escapeMarkdown(oldName)}: to :${Util.escapeMarkdown(
          newName
        )}: in ${cluster.displayString()}: ${targetEmote}`
      );
    } catch (e) {
      logger.error("Error renaming emote", e);
      return message.reply(`Emote name rejected by discord, check formatting ❌`);
    }
  }
}
