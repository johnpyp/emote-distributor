import { Client, Message, Util } from "discord.js";
import _ from "lodash";
import { logger } from "../logger";
import { Command, CommandUtil } from "./command";
import { CommandStore } from "./command-store";
import { formatSubcommandHelp } from "./util";

export interface ParsedMessage {
  prefix: string;
  args: string[];
  message: Message;
}

export interface CommandHandlerOptions {
  client: Client;
  defaultPrefix: string;
  admins: string[];
}

export class CommandHandler {
  public commandStore: CommandStore = new CommandStore();

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
    const command = this.commandStore.aliasFind(parsed.args);
    if (!command) {
      await message.reply(`Invalid command, try using ${this.opts.defaultPrefix}help`);
      return;
    }
    if (Array.isArray(command)) return this.handleOnlySubcommands(command, parsed);

    await this.handleCommand(command, parsed);
  }

  private async handleCommand(command: Command, parsed: ParsedMessage): Promise<void> {
    const { message } = parsed;

    if (command.guildOnly && message.channel.type === "DM") return;

    const strippedArgs = this.stripArgs(command, parsed.args);
    if (!strippedArgs) throw new Error("Couldn't strip parsed args");
    try {
      await command.exec(message, strippedArgs, this.commandUtil);
    } catch (e) {
      const error = e as Error;
      if (_.isFunction(e.createUserMessage)) {
        const userMessage = e.createUserMessage(command);
        await message.reply(userMessage);
        return;
      }
      console.error(error);
      logger.error("Error occurred while sending message", error);
      await message.reply("Internal error");
    }
  }

  private async handleOnlySubcommands(commands: Command[], parsed: ParsedMessage): Promise<void> {
    const help = formatSubcommandHelp(commands, parsed.args);
    const chunks = Util.splitMessage(help?.join("\n") ?? "");
    for (const chunk of chunks) {
      await parsed.message.reply(chunk);
    }
  }

  private stripArgs(command: Command, args: string[]): string[] | null {
    const stringArgs = args.join(" ");
    const foundAlias = command.aliases.find((alias) => stringArgs.startsWith(alias));
    if (!foundAlias) return null;

    const strippedArgs = stringArgs.slice(foundAlias.length).trim();
    return strippedArgs.split(" ");
  }

  public static parseContent(message: Message, prefixes: string[]): ParsedMessage | null {
    const prefix = prefixes.find((p) => message.content.startsWith(p));
    if (!prefix) return null;
    const allArgs = message.content.slice(prefix.length).trim().split(/\s+/);

    logger.verbose(`Parsed args: ${allArgs}`);
    return {
      prefix,
      args: allArgs,
      message,
    };
  }
}
