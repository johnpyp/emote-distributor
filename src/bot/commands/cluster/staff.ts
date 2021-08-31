import { Message } from "discord.js";
import { Cluster } from "../../../entities/Cluster";
import { ClusterUser } from "../../../entities/ClusterUser";
import { Command } from "../../command";
import {
  guardPermissions,
  hierarchyMap,
  Permission,
  roleDisplaynames,
  Roles,
} from "../../permissions";

export class ClusterStaff extends Command {
  constructor() {
    super({
      id: "cluster:staff",
      aliases: ["cluster staff"],
      guildOnly: true,
      argsFormat: [""],
      description: "List staff who can add emotes and control the bot",
    });
  }

  async exec(message: Message, args: string[]): Promise<void> {
    const { cluster, role } = await Cluster.getImplicitClusterAndRoleGuard(
      message.guild?.id,
      message.author.id
    );

    guardPermissions(role, [Permission.ClusterStaff]);

    console.log({ cluster });
    const staff = cluster.clusterUsers.filter((u) => u.role !== Roles.Anonymous);

    const sendMessage: string[] = [`**Cluster Staff**: ${cluster.displayString()}`, ``];

    staff.sort((a, b) => {
      if (hierarchyMap[a.role] > hierarchyMap[b.role]) return 1;
      if (hierarchyMap[a.role] < hierarchyMap[b.role]) return -1;
      return 0;
    });

    staff.forEach((u) => {
      sendMessage.push(`<@${u.userId}> - ${roleDisplaynames[u.role]}`);
    });

    await message.channel.send({ content: sendMessage.join("\n"), allowedMentions: { users: [] } });
  }
}
