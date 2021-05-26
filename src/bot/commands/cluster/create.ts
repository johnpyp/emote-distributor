import { Message } from "discord.js";
import _ from "lodash";
import { Cluster } from "../../../entities/Cluster";
import { ClusterUser } from "../../../entities/ClusterUser";
import { User } from "../../../entities/User";
import { Command } from "../../command";
import { Roles } from "../../permissions";

export class ClusterCreate extends Command {
  constructor(id: string) {
    super(id, { aliases: [], guildOnly: true });
  }

  async exec(message: Message, args: string[]): Promise<unknown> {
    const [publicClusterId, clusterName] = args;

    Cluster.publicClusterIdGuard(publicClusterId);

    if (await Cluster.findOne({ publicClusterId }))
      return message.reply(`Cluster '${publicClusterId}' already exists ❌`);

    const user = await User.findOrCreate(message.author.id);

    const cluster = await Cluster.create({
      name: clusterName ?? _.startCase(_.toLower(publicClusterId)),
      publicClusterId,
      enableInvites: true,
      enableInfo: true,
      emoteManagersCanModerate: true,
    }).save();

    const clusterUser = ClusterUser.create({ user, cluster, role: Roles.ClusterOwner });
    await clusterUser.save();

    return message.reply(`Cluster ${cluster.displayString()} created 🚀`);
  }
}
