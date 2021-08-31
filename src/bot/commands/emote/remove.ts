import { Message } from "discord.js";
import { Cluster } from "../../../entities/Cluster";
import { ArgsError } from "../../../errors";
import { Command } from "../../command";
import { checkPermissions, Permission } from "../../permissions";
import { canManageEmoji, resolveEmote } from "../../util";

export class EmoteRemove extends Command {
  constructor() {
    super({
      id: "emote:remove",
      aliases: ["emote remove"],
      guildOnly: true,
      argsFormat: ["<emote | emote name>"],
      description: "Remove a given emote or emote name from the cluster.",
    });
  }

  async exec(message: Message, args: string[]): Promise<unknown> {
    const [nameOrEmote] = args;
    if (!nameOrEmote) throw new ArgsError("No emote or emote name provided ❌");
    const { cluster, role } = await Cluster.getImplicitClusterAndRoleGuard(
      message.guild?.id,
      message.author.id
    );
    const manageEmojisCheck = canManageEmoji(cluster, message.member);

    if (!checkPermissions(role, [Permission.RemoveEmote]) && !manageEmojisCheck) {
      return message.reply(`Insufficient permissions ❌`);
    }

    const guilds = cluster.getDiscordGuilds(this.client);
    const emoji = await resolveEmote(guilds, nameOrEmote);

    emoji.delete("Deleted by bot");

    return message.reply(`Deleted ${emoji} from ${cluster.displayString()} 💀`);
  }
}
