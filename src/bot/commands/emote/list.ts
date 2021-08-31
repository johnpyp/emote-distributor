import { Message } from "discord.js";
import _ from "lodash";
import { Cluster } from "../../../entities/Cluster";
import { Command } from "../../command";
import { guardPermissions, Permission } from "../../permissions";

export class EmoteList extends Command {
  constructor() {
    super({
      id: "emote:list",
      aliases: ["emote list"],
      guildOnly: true,
      argsFormat: [""],
      description: "List all the emotes in the cluster, as a big blob of messages.",
    });
  }

  async exec(message: Message, args: string[]): Promise<void> {
    const { cluster, role } = await Cluster.getImplicitClusterAndRoleGuard(
      message.guild?.id,
      message.author.id
    );

    guardPermissions(role, [Permission.ListEmotes]);

    const guilds = cluster.getDiscordGuilds(this.client);
    const emotes = guilds.flatMap((guild) => guild.emojis.cache);

    await message.channel.send(`**All Emotes**: ${cluster.displayString()}`);
    if (emotes.size > 0) {
      const emotePayload = _.chunk(
        emotes.map((emote) => emote.toString()),
        20
      ).map((chunk) => chunk.join(" "));
      for (const chunk of emotePayload) {
        await message.channel.send(chunk);
      }
      return;
    }
    await message.channel.send("No emotes");
  }
}
