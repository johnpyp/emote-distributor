import { Client, Message } from "discord.js";
import { logger } from "../logger";
import { Command, CommandUtil } from "./command";
import { CommandStore } from "./command-store";
import { UserError } from "./util";

export interface ParsedMessage {
  prefix: string;
  command: string;
  args: string[];
  message: Message;
}

export interface CommandHandlerOptions {
  client: Client;
  defaultPrefix: string;
  admins: string[];
}

export class CommandHandler {
  private commandStore: CommandStore = new CommandStore();

  private client: Client;

  private opts: CommandHandlerOptions;

  private commandUtil: CommandUtil;

  constructor(opts: CommandHandlerOptions) {
    this.client = opts.client;
    this.opts = opts;

    this.commandUtil = {
      isBotAdmin: (id) => this.opts.admins.includes(id),
    };
  }

  public register(command: Command): void {
    this.commandStore.register(command);
    command.setup(this.client);
  }

  public deregister(id: string): void {
    this.commandStore.deregister(id);
  }

  public async handleMessage(message: Message): Promise<void> {
    const parsed = CommandHandler.parseContent(message, [this.opts.defaultPrefix]);
    if (!parsed) return;
    const command = this.commandStore.aliasFind(parsed.command);
    if (!command) return;
    return this.handleParsedMessage(command, parsed);
  }

  private async handleParsedMessage(command: Command, parsed: ParsedMessage): Promise<void> {
    const { message } = parsed;

    if (command.guildOnly && message.channel.type === "dm") return;

    const { subCommands } = command;
    if (subCommands && parsed.args.length > 0) {
      const subCommandId = subCommands.get(parsed.args[0]);
      const nextCommand = this.commandStore.get(subCommandId);
      if (nextCommand) {
        return this.handleParsedMessage(nextCommand, {
          ...parsed,
          command: `${parsed.command} ${parsed.args[0]}`,
          args: parsed.args.slice(1),
        });
      }
    }

    try {
      await command.exec(message, parsed.args, this.commandUtil);
    } catch (e) {
      const error = e as Error;
      if (error instanceof UserError) {
        await message.reply(error.message);
        return;
      }
      console.error(error);
      logger.error("Error occurred while sending message", error);
      await message.reply("Internal error");
      /* handle error */
    }
  }

  public static parseContent(message: Message, prefixes: string[]): ParsedMessage | null {
    const prefix = prefixes.find((p) => message.content.startsWith(p));
    if (!prefix) return null;
    const allArgs = message.content.slice(prefix.length).trim().split(" ");

    const command = allArgs[0];
    if (!command) return null;

    logger.verbose(`Parsed command: ${command}, args: ${allArgs.slice(1)}`);
    return {
      prefix,
      command,
      args: allArgs.slice(1),
      message,
    };
  }
}
