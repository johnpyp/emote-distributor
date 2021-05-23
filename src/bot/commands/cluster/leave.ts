import { Message } from "discord.js";
import { Guild } from "../../../entities/Guild";
import { Command } from "../../command";

export class ClusterLeaveCommand extends Command {
  constructor() {
    super("cluster:leave", { aliases: [], guildOnly: true });
  }

  async exec(message: Message, args: string[]): Promise<unknown> {
    const discordGuild = message.guild;
    if (!discordGuild) return;

    const guild = await Guild.findOne(discordGuild.id, { relations: ["cluster"] });

    if (!guild) return message.reply("Guild not part of a cluster ❌");

    if (
      !guild.cluster.isAdmin(message.author.id) &&
      !message.member?.hasPermission(["MANAGE_GUILD"])
    )
      return message.reply(`You do not have permission to leave this cluster with this server ❌`);

    await guild.remove();

    return message.reply(
      `Guild '${discordGuild.name}' removed from cluster '${guild.cluster.name}' (${guild.cluster.publicClusterId}) 💀`
    );
  }
}
