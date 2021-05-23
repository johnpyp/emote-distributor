import { CommandHandler } from "./command-handler";
import { ClusterCreateCommand } from "./commands/cluster/create";
import { ClusterDeleteCommand } from "./commands/cluster/delete";
import { PingCommand } from "./commands/ping";
import { SubcommandHandler } from "./subcommand";

export function registerCommands(handler: CommandHandler): void {
  handler.register(new PingCommand());
  handler.register(new ClusterCreateCommand());
  handler.register(new ClusterDeleteCommand());
  handler.register(
    new SubcommandHandler(
      "cluster",
      { create: "cluster:create", delete: "cluster:delete" },
      { aliases: ["cluster"] }
    )
  );
}
