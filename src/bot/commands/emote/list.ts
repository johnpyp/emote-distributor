import { Message } from "discord.js";
import _ from "lodash";
import { Cluster } from "../../../entities/Cluster";
import { Command } from "../../command";
import { guardPermissions, Permission } from "../../permissions";

export class EmoteList extends Command {
  constructor(id: string) {
    super(id, { aliases: [], guildOnly: true });
  }

  async exec(message: Message, args: string[]): Promise<void> {
    const { cluster, role } = await Cluster.getImplicitClusterAndRoleGuard(
      message.guild?.id,
      message.author.id
    );

    guardPermissions(role, [Permission.ListEmotes]);

    const guilds = cluster.getDiscordGuilds(this.client);
    const emotes = guilds.flatMap((guild) => guild.emojis.cache);

    await message.channel.send([`**All Emotes**: ${cluster.displayString()}`]);
    if (emotes.size > 0) {
      const emotePayload = _.chunk(
        emotes.map((emote) => emote.toString()),
        20
      ).map((chunk) => chunk.join(" "));
      await message.channel.send(emotePayload, { split: true });
      return;
    }
    await message.channel.send("No emotes");
  }
}
