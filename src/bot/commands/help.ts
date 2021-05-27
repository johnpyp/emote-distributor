import { Message } from "discord.js";
import { Command } from "../command";
import { CommandStore } from "../command-store";
import { formatManyHelp } from "../util";

export class Help extends Command {
  private commandStore: CommandStore;

  constructor(commandStore: CommandStore) {
    super({
      id: "help",
      aliases: ["help", "commands"],
      guildOnly: true,
      argsFormat: [""],
      description: "List commands and descriptions.",
    });
    this.commandStore = commandStore;
  }

  async exec(message: Message): Promise<void> {
    const responseMessage: string[] = ["**Emote Distributor Commands**", ""];
    const commands = this.commandStore.list();
    responseMessage.push(...formatManyHelp(commands));
    await message.reply(responseMessage, { split: true });

    // this.commandStore.list().forEach((command) => {
    //   if (command.subCommands) const help = formatHelp(s, possibleArgs, description);
    // });
    //
    // logger.verbose("Received ping");
    // const sent = await message.reply("Pong!");
    // const timeDiff =
    //   (sent.editedAt?.valueOf() || sent.createdAt?.valueOf()) -
    //   (message.editedAt?.valueOf() || message.createdAt?.valueOf());
    // await message.reply([
    //   `🔂 **RTT**: ${timeDiff} ms`,
    //   `💟 **Heartbeat**: ${Math.round(this.client.ws.ping)} ms`,
    // ]);
  }
}
