import { Message } from "discord.js";
import { logger } from "../../logger";
import { Command } from "../command";

export class Ping extends Command {
  constructor(id: string) {
    super(id, { aliases: ["ping"], guildOnly: true });
  }

  async exec(message: Message): Promise<void> {
    logger.verbose("Received ping");
    const sent = await message.reply("Pong!");
    const timeDiff =
      (sent.editedAt?.valueOf() || sent.createdAt?.valueOf()) -
      (message.editedAt?.valueOf() || message.createdAt?.valueOf());
    await message.reply([
      `🔂 **RTT**: ${timeDiff} ms`,
      `💟 **Heartbeat**: ${Math.round(this.client.ws.ping)} ms`,
    ]);
  }
}
