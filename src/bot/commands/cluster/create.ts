import { Message } from "discord.js";
import _ from "lodash";
import { Cluster } from "../../../entities/Cluster";
import { User } from "../../../entities/User";
import { Command } from "../../command";

export class ClusterCreateCommand extends Command {
  constructor() {
    super("cluster:create", { aliases: [], guildOnly: true });
  }

  async exec(message: Message, args: string[]): Promise<unknown> {
    const [clusterId, clusterName] = args;
    if (!clusterId) return message.reply("No cluster id provided ❌");

    if (!/^[a-z-]+$/.test(clusterId))
      return message.reply("Cluster id can only contain lowercase letters and hyphens (-) ❌");

    if (await Cluster.findOne({ publicClusterId: clusterId }))
      return message.reply(`Cluster '${clusterId}' already exists ❌`);

    const user = await User.findOrCreate(message.author.id);

    const cluster = await Cluster.create({
      name: clusterName ?? _.startCase(_.toLower(clusterId)),
      publicClusterId: clusterId,
      owner: user,
      enableInvites: true,
      enableInfo: true,
      emoteManagersCanModerate: true,
    }).save();

    return message.reply(`Cluster '${cluster.name}' (${cluster.publicClusterId}) created 🚀`);
  }
}
