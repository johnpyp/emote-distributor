import { Message } from "discord.js";
import { Cluster } from "../../../entities/Cluster";
import { Guild } from "../../../entities/Guild";
import { Command } from "../../command";

export class ClusterJoinCommand extends Command {
  constructor() {
    super("cluster:join", { aliases: [], guildOnly: true });
  }

  async exec(message: Message, args: string[]): Promise<unknown> {
    const discordGuild = message.guild;
    if (!discordGuild) return;

    const [clusterId] = args;
    if (!clusterId) return message.reply("No cluster id provided ❌");

    if (!/^[a-z-]+$/.test(clusterId))
      return message.reply("Cluster id can only contain lowercase letters and hyphens (-) ❌");

    const cluster = await Cluster.findOne(
      { publicClusterId: clusterId },
      { relations: ["guilds"] }
    );
    if (!cluster) return message.reply(`Cluster '${clusterId}' doesn't exist ❌`);

    if (!cluster.isAdmin(message.author.id) || !message.member?.hasPermission(["MANAGE_GUILD"]))
      return message.reply(`You do not have permission to join this cluster with this server ❌`);

    if (await Guild.findOne(discordGuild.id))
      return message.reply("Guild already part of a cluster ❌");

    await Guild.create({
      id: discordGuild.id,
      cluster,
    }).save();

    await cluster.reload();

    return message.reply(
      `Guild '${discordGuild.name}' is now a part of cluster '${cluster.name}' (${cluster.publicClusterId}) 🚀`
    );
  }
}
