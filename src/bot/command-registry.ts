import { CommandHandler } from "./command-handler";
import { ClusterClearRole } from "./commands/cluster/clear-role";
import { ClusterCreate } from "./commands/cluster/create";
import { ClusterDelete } from "./commands/cluster/delete";
import { ClusterInfo } from "./commands/cluster/info";
import { ClusterJoin } from "./commands/cluster/join";
import { ClusterLeave } from "./commands/cluster/leave";
import { ClusterSetRole } from "./commands/cluster/set-role";
import { EmoteAdd } from "./commands/emote/add";
import { EmoteList } from "./commands/emote/list";
import { EmoteRemove } from "./commands/emote/remove";
import { EmoteRename } from "./commands/emote/rename";
import { Help } from "./commands/help";
import { Ping } from "./commands/ping";

export function registerCommands(handler: CommandHandler): void {
  handler.register(new Ping());
  handler.register(new Help(handler.commandStore));
  handler.register(new ClusterCreate());
  handler.register(new ClusterDelete());
  handler.register(new ClusterJoin());
  handler.register(new ClusterLeave());
  handler.register(new ClusterInfo());
  handler.register(new ClusterSetRole());
  handler.register(new ClusterClearRole());

  handler.register(new EmoteAdd());
  handler.register(new EmoteRemove());
  handler.register(new EmoteList());
  handler.register(new EmoteRename());
}
