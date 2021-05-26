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
import { Ping } from "./commands/ping";
import { SubcommandHandler } from "./subcommand";

export function registerCommands(handler: CommandHandler): void {
  handler.register(new Ping("ping"));
  handler.register(new ClusterCreate("cluster:create"));
  handler.register(new ClusterDelete("cluster:delete"));
  handler.register(new ClusterJoin("cluster:join"));
  handler.register(new ClusterLeave("cluster:leave"));
  handler.register(new ClusterInfo("cluster:info"));
  handler.register(new ClusterSetRole("cluster:set-role"));
  handler.register(new ClusterClearRole("cluster:clear-role"));

  handler.register(
    new SubcommandHandler(
      "cluster",
      {
        create: "cluster:create",
        delete: "cluster:delete",
        join: "cluster:join",
        leave: "cluster:leave",
        info: "cluster:info",
        "set-role": "cluster:set-role",
        "clear-role": "cluster:clear-role",
      },
      { aliases: ["cluster"] }
    )
  );

  handler.register(new EmoteAdd("emote:add"));
  handler.register(new EmoteRemove("emote:remove"));
  handler.register(new EmoteList("emote:list"));
  handler.register(new EmoteRename("emote:rename"));

  handler.register(
    new SubcommandHandler(
      "emote",
      {
        add: "emote:add",
        remove: "emote:remove",
        delete: "emote:remove",
        list: "emote:list",
        rename: "emote:rename",
      },
      { aliases: ["emote"] }
    )
  );
}
