import { Message, Util } from "discord.js";
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
    for (const part of Util.splitMessage(responseMessage.join("\n"))) {
      await message.reply(part);
    }
  }
}
