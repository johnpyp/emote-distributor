import "reflect-metadata";
import { Client, Intents } from "discord.js";
import { logger } from "../logger";
import { CommandHandler } from "./command-handler";
import { registerCommands } from "./command-registry";

export class Bot {
  private client: Client;

  private commandHandler: CommandHandler;

  static async create(botToken: string): Promise<Bot> {
    const client = new Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
      ],
      partials: ["MESSAGE"],
    });
    const bot = new Bot(client);

    await bot.initialize(botToken);
    return bot;
  }

  constructor(client: Client) {
    this.client = client;
    this.commandHandler = new CommandHandler({
      client,
      defaultPrefix: "!",
      admins: ["151518034043863040"],
    });
  }

  async initialize(botToken: string): Promise<void> {
    this.client.once("ready", () => {
      logger.info("Client is ready");
    });

    this.client.on("messageCreate", async (message) => {
      try {
        await this.commandHandler.handleMessage(message);
      } catch (e) {
        logger.error("Error running command", e);
      }
    });

    this.client.login(botToken);
    registerCommands(this.commandHandler);
  }
}
