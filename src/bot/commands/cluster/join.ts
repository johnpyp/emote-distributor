import { Message } from "discord.js";
import { Cluster } from "../../../entities/Cluster";
import { Guild } from "../../../entities/Guild";
import { Command } from "../../command";
import { guardPermissions, Permission } from "../../permissions";
import { UserError } from "../../util";

export class ClusterJoin extends Command {
  constructor() {
    super({
      id: "cluster:join",
      aliases: ["cluster join"],
      guildOnly: true,
      argsFormat: ["<cluster id>"],
      description:
        "Join this guild to a cluster with given id. Requires cluster manager permissions and permission to manage guild for the joining guild.",
    });
  }

  async exec(message: Message, args: string[]): Promise<unknown> {
    const [publicClusterId] = args;
    const discordGuild = message.guild;
    if (!discordGuild) return;

    const { cluster, role } = await Cluster.getPublicClusterAndRoleGuard(
      publicClusterId,
      message.author.id
    );

    guardPermissions(role, Permission.JoinCluster);
    if (!message.member?.hasPermission(["MANAGE_GUILD"]))
      throw new UserError(`Insufficient permissions ❌`);

    if (await Guild.findOne(discordGuild.id))
      return message.reply("Guild already part of a cluster ❌");

    const guild = Guild.create({
      id: discordGuild.id,
    });

    cluster.guilds.push(guild);
    cluster.save();

    return message.reply(
      `${discordGuild.name} is now a part of cluster ${cluster.displayString()} 🚀`
    );
  }
}
