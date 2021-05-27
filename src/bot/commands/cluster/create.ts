import { Message } from "discord.js";
import _ from "lodash";
import { Cluster } from "../../../entities/Cluster";
import { ClusterUser } from "../../../entities/ClusterUser";
import { User } from "../../../entities/User";
import { Command } from "../../command";
import { Roles } from "../../permissions";

export class ClusterCreate extends Command {
  constructor() {
    super({
      id: "cluster:create",
      aliases: ["cluster create"],
      guildOnly: true,
      argsFormat: ["<cluster id> [cluster name...]"],
      description: "Create a emote cluster with the given id and optional name",
    });
  }

  async exec(message: Message, args: string[]): Promise<unknown> {
    const [publicClusterId, ...clusterNameArgs] = args;

    Cluster.publicClusterIdGuard(publicClusterId);

    if (await Cluster.findOne({ publicClusterId }))
      return message.reply(`Cluster '${publicClusterId}' already exists ❌`);

    const user = await User.findOrCreate(message.author.id);

    const clusterName = clusterNameArgs.length >= 1 ? clusterNameArgs.join(" ").trim() : undefined;
    const cluster = await Cluster.create({
      name: clusterName ?? _.startCase(_.toLower(publicClusterId)),
      publicClusterId,
      enableInvites: true,
      enableInfo: true,
      emoteManagersCanModerate: true,
    }).save();

    await ClusterUser.create({
      user,
      cluster,
      role: Roles.ClusterOwner,
    }).save();

    return message.reply(`Cluster ${cluster.displayString()} created 🚀`);
  }
}
