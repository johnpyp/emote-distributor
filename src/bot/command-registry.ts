import { CommandHandler } from "./command-handler";
import { ClusterCreateCommand } from "./commands/cluster/create";
import { ClusterDeleteCommand } from "./commands/cluster/delete";
import { ClusterJoinCommand } from "./commands/cluster/join";
import { ClusterLeaveCommand } from "./commands/cluster/leave";
import { PingCommand } from "./commands/ping";
import { SubcommandHandler } from "./subcommand";

export function registerCommands(handler: CommandHandler): void {
  handler.register(new PingCommand());
  handler.register(new ClusterCreateCommand());
  handler.register(new ClusterDeleteCommand());
  handler.register(new ClusterJoinCommand());
  handler.register(new ClusterLeaveCommand());
  handler.register(
    new SubcommandHandler(
      "cluster",
      {
        create: "cluster:create",
        delete: "cluster:delete",
        join: "cluster:join",
        leave: "cluster:leave",
      },
      { aliases: ["cluster"] }
    )
  );
}
