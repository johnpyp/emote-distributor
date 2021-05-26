import { Message } from "discord.js";
import { Cluster } from "../../../entities/Cluster";
import { Command } from "../../command";
import { checkPermissions, Permission } from "../../permissions";
import { resolveEmote } from "../../util";

export class EmoteRemove extends Command {
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

    if (!checkPermissions(role, [Permission.RemoveEmote]) && !manageEmojisCheck) {
      return message.reply(`Insufficient permissions ❌`);
    }

    const guilds = cluster.getDiscordGuilds(this.client);
    const emoji = await resolveEmote(guilds, args[0]);

    emoji.delete("Deleted by bot");

    return message.reply(`Deleted ${emoji} from ${cluster.displayString()} 💀`);
  }
}
