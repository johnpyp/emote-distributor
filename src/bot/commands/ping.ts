import { Message } from "discord.js";
import { logger } from "../../logger";
import { Command } from "../command";

export class Ping extends Command {
  constructor() {
    super({
      id: "ping",
      aliases: ["ping"],
      guildOnly: true,
      argsFormat: [""],
      description: "Pong! (bot healthcheck)",
    });
  }

  async exec(message: Message): Promise<void> {
    logger.verbose("Received ping");
    const sent = await message.reply("Pong!");
    const timeDiff =
      (sent.editedAt?.valueOf() || sent.createdAt?.valueOf()) -
      (message.editedAt?.valueOf() || message.createdAt?.valueOf());
    await message.reply(
      [
        `🔂 **RTT**: ${timeDiff} ms`,
        `💟 **Heartbeat**: ${Math.round(this.client.ws.ping)} ms`,
      ].join("\n")
    );
  }
}
