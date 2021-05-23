import { Message } from "discord.js";
import { Cluster } from "../../../entities/Cluster";
import { Command } from "../../command";

export class ClusterDeleteCommand extends Command {
  constructor() {
    super("cluster:delete", { aliases: [], guildOnly: true });
  }

  async exec(message: Message, args: string[]): Promise<unknown> {
    const [clusterId] = args;
    if (!clusterId) return message.reply("No cluster id provided ❌");

    if (!/^[a-z-]+$/.test(clusterId))
      return message.reply("Cluster id can only contain lowercase letters and hyphens (-) ❌");

    const cluster = await Cluster.findOne({ publicClusterId: clusterId });
    if (!cluster) return message.reply(`Cluster '${clusterId}' doesn't exist ❌`);

    if (!cluster.isOwner(message.author.id))
      return message.reply(`You do not have permission to delete this cluster ❌`);

    await cluster.remove();

    return message.reply(`Cluster ${cluster.publicClusterId} has been deleted! 💀`);
  }
}
