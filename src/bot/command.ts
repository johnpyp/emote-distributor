import { Client, Message } from "discord.js";

export interface CommandOptions {
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

export abstract class Command {
  public id: string;

  public aliases: string[];

  public client: Client;

  public guildOnly: boolean;

  public cooldown: number;

  public userCooldown: number;

  public subCommands?: Map<string, string>;

  constructor(id: string, opts: CommandOptions = {}) {
    this.id = id;
    this.aliases = opts.aliases ?? [];
    this.guildOnly = opts.guildOnly ?? false;

    this.cooldown = opts.cooldown ?? 1;
    this.userCooldown = opts.cooldown ?? 2;
  }

  abstract exec(message: Message, args: string[]): Promise<void>;

  public setup(client: Client): Command {
    this.client = client;
    return this;
  }
}
