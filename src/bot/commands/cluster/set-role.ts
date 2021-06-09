import { Message } from "discord.js";
import { Cluster } from "../../../entities/Cluster";
import { ClusterUser } from "../../../entities/ClusterUser";
import { User } from "../../../entities/User";
import { Command } from "../../command";
import {
  guardPermissions,
  Permission,
  roleDisplaynames,
  roleNames,
  Roles,
} from "../../permissions";
import { ArgsError, getUserFromMention, UserError } from "../../util";

const setRolePermissionGroups: Record<string, Permission[]> = {
  [Roles.ClusterManager]: [Permission.OverrideManager],
  [Roles.ClusterModerator]: [Permission.OverrideModerator],
};
export class ClusterSetRole extends Command {
  constructor() {
    super({
      id: "cluster:set-role",
      aliases: ["cluster set-role"],
      guildOnly: true,
      argsFormat: ["<user mention> <moderator | manager>"],
      description:
        "Give cluster permissions to another user. Can only give a role lower than your own.",
    });
  }

  async exec(message: Message, args: string[]): Promise<unknown> {
    const [userArg, roleType] = args;
    if (!userArg) throw new ArgsError("No user mentioned ❌");
    if (!roleType) throw new ArgsError("No role provided ❌");
    const { cluster, role } = await Cluster.getImplicitClusterAndRoleGuard(
      message.guild?.id,
      message.author.id
    );

    const targetUserRole = roleNames[roleType];
    if (!targetUserRole) throw new UserError("Role doesn't exist ❌");

    guardPermissions(role, setRolePermissionGroups[targetUserRole] ?? [Permission.DISALLOWED]);

    const targetUser = getUserFromMention(this.client, userArg);
    if (!targetUser) throw new UserError("Could not find target user ❌");

    const user = await User.findOrCreate(targetUser.id);
    const clusterUser = await ClusterUser.findOne({
      userId: user.id,
      clusterId: cluster.id,
    });
    if (clusterUser) {
      guardPermissions(role, setRolePermissionGroups[clusterUser.role] ?? [Permission.DISALLOWED]);
      clusterUser.role = targetUserRole;
      await clusterUser.save();
    } else {
      const newClusterUser = ClusterUser.create({ user, cluster, role: targetUserRole });
      await newClusterUser.save();
    }

    return message.reply(
      `Set ${targetUser} as ${roleDisplaynames[targetUserRole]} for ${cluster.displayString()} 🚀`
    );
  }
}
