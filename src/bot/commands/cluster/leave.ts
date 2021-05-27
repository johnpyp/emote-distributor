import { Message } from "discord.js";
import { Cluster } from "../../../entities/Cluster";
import { Command } from "../../command";
import { guardPermissions, Permission } from "../../permissions";

export class ClusterLeave extends Command {
  constructor() {
    super({
      id: "cluster:leave",
      aliases: ["cluster leave"],
      guildOnly: true,

      argsFormat: [""],
      description:
        "Leave this guild from the cluster it's currently apart of. Requires cluster manager permissions.",
    });
  }

  async exec(message: Message, args: string[]): Promise<unknown> {
    const { cluster, role, guild } = await Cluster.getImplicitClusterAndRoleGuard(
      message.guild?.id,
      message.author.id
    );

    guardPermissions(role, Permission.LeaveCluster);

    await guild.remove();

    return message.reply(
      `Guild '${message.guild?.name}' removed from cluster ${cluster.displayString()} 💀`
    );
  }
}
