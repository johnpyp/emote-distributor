import { Message } from "discord.js";
import { Command, CommandOptions } from "./command";

export class SubcommandHandler extends Command {
  public subCommands: Map<string, string> = new Map();

  constructor(id: string, mappings: Record<string, string>, opts: CommandOptions = {}) {
    super(id, opts);
    Object.keys(mappings).forEach((k) => this.subCommands.set(k, mappings[k]));
  }

  public async exec(message: Message): Promise<void> {
    const subcommandsList = [...this.subCommands.keys()].sort().join(", ");
    await message.reply(`Use one of the subcommands: ${subcommandsList}`);
  }
}
