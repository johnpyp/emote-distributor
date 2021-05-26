import { Message } from "discord.js";
import { Cluster } from "../../../entities/Cluster";
import { Command } from "../../command";
import { guardPermissions, Permission } from "../../permissions";
import { displayPercentage, getEmojiUsage } from "../../util";

export class ClusterInfo extends Command {
  constructor(id: string) {
    super(id, { aliases: [], guildOnly: true });
  }

  async exec(message: Message, args: string[]): Promise<void> {
    const { cluster, role } = await Cluster.getImplicitClusterAndRoleGuard(
      message.guild?.id,
      message.author.id
    );

    guardPermissions(role, [Permission.ClusterInfo]);

    const guilds = cluster.getDiscordGuilds(this.client);
    const usages = guilds.map((guild) => getEmojiUsage(guild));
    const emotes = guilds.flatMap((guild) => guild.emojis.cache);

    const sendMessage: string[] = [`**Cluster Info**: ${cluster.displayString()}`];

    sendMessage.push(``, `**Guilds**: ${guilds.size}`);
    usages.forEach((usage) => {
      const totalPerc = displayPercentage(usage.totalPerc);
      sendMessage.push(
        `\`${usage.guild.name}\`:  ${usage.total} / ${usage.totalLimit} (${totalPerc}) (${usage.animated} gif, ${usage.static} normal)`
      );
    });
    const overallCapacity = usages.reduce((total, usage) => total + usage.totalLimit, 0);
    const overallPerc = displayPercentage(emotes.size / overallCapacity);
    sendMessage.push(``, `**Total**: ${emotes.size} / ${overallCapacity} (${overallPerc})`);
    await message.channel.send(sendMessage);
  }
}

function getEmojiLimit(premiumTier: number) {}
