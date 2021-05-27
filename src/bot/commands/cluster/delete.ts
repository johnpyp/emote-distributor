import { Message } from "discord.js";
import { Cluster } from "../../../entities/Cluster";
import { Command } from "../../command";
import { guardPermissions, Permission } from "../../permissions";

export class ClusterDelete extends Command {
  constructor() {
    super({
      id: "cluster:delete",
      aliases: ["cluster delete"],
      guildOnly: true,
      argsFormat: ["<cluster id>"],
      description: "Delete the cluster with given id, if you're the cluster owner",
    });
  }

  async exec(message: Message, args: string[]): Promise<unknown> {
    const [publicClusterId] = args;

    Cluster.publicClusterIdGuard(publicClusterId);

    const { cluster, role } = await Cluster.getPublicClusterAndRoleGuard(
      publicClusterId,
      message.author.id
    );

    guardPermissions(role, Permission.DeleteCluster);

    await cluster.remove();

    return message.reply(`Cluster ${cluster.displayString()} has been deleted 💀`);
  }
}
