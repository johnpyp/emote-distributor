import { Message } from "discord.js";
import { Cluster } from "../../../entities/Cluster";
import { ClusterUser } from "../../../entities/ClusterUser";
import { ArgsError, UserError } from "../../../errors";
import { Command } from "../../command";
import { guardPermissions, Permission, Roles } from "../../permissions";
import { getUserFromMention } from "../../util";

const clearRolePermissionGroup: Record<string, Permission[]> = {
  [Roles.ClusterManager]: [Permission.OverrideManager],
  [Roles.ClusterModerator]: [Permission.OverrideModerator],
};
export class ClusterClearRole extends Command {
  constructor() {
    super({
      id: "cluster:clear-role",
      aliases: ["cluster clear-role"],
      guildOnly: true,
      argsFormat: ["<user mention>"],
      description: "Clear any roles and permissions for this Guild's cluster from a user",
    });
  }

  async exec(message: Message, args: string[]): Promise<unknown> {
    const [userArg] = args;
    if (!userArg) throw new ArgsError("No user mentioned ❌");
    const { cluster, role } = await Cluster.getImplicitClusterAndRoleGuard(
      message.guild?.id,
      message.author.id
    );

    const targetUser = getUserFromMention(this.client, userArg);
    if (!targetUser) throw new UserError("Error parsing target user ❌");

    const clusterUser = await ClusterUser.findOne({
      userId: targetUser.id,
      clusterId: cluster.id,
    });
    if (!clusterUser) throw new UserError("User doesn't have a role in this cluster ❌");

    guardPermissions(role, clearRolePermissionGroup[clusterUser.role] ?? [Permission.DISALLOWED]);

    await clusterUser.remove();

    return message.reply(`Cleared ${targetUser}'s roles for ${cluster.displayString()} 💀`);
  }
}
