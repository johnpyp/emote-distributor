import { Client, Message } from "discord.js";

export interface CommandOptions {
  /**
   * Unique id identifying the command
   */
  id: string;

  /**
   * Args structure for help commands
   *
   * e.g ["<emote name> <emote | url | attachment>", "<emote>"]
   *
   *
   */
  argsFormat: string[];

  /**
   * Description of the command for help commands
   *
   * e.g "Add an emote with chosen name, along with a source emote you already have, a url to an image/gif, or attachment with the image or gif"
   *
   *
   */
  description: string;

  /**
   * Whether this command only works in a guild text channel
   *
   * Default: false
   */
  guildOnly?: boolean;
  /**
   * List of aliases for this command
   *
   * Default: []
   */
  aliases?: string[];
  /**
   * Per-channel command cooldown time in seconds
   *
   * Default: 1
   */
  cooldown?: number;

  /**
   * Per-user command cooldown time in seconds
   *
   * Default: 2
   */
  userCooldown?: number;
}

export interface CommandUtil {
  isBotAdmin: (id: string) => boolean;
}

export abstract class Command {
  public id: string;

  public aliases: string[];

  public client: Client;

  public guildOnly: boolean;

  public cooldown: number;

  public userCooldown: number;

  public argsFormat: string[];

  public description: string;

  constructor(opts: CommandOptions) {
    this.id = opts.id;

    this.argsFormat = opts.argsFormat;
    this.description = opts.description;

    this.aliases = opts.aliases ?? [];
    this.guildOnly = opts.guildOnly ?? false;

    this.cooldown = opts.cooldown ?? 1;
    this.userCooldown = opts.cooldown ?? 2;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract exec(message: Message, args: string[], util: CommandUtil): Promise<any>;

  public setup(client: Client): Command {
    this.client = client;
    return this;
  }
}
