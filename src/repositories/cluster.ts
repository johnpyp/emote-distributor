import { Collection, Guild as DiscordGuild, GuildManager } from "discord.js";
import { EntityRepository, Repository } from "typeorm";
import { Cluster } from "../entities/Cluster";

@EntityRepository(Cluster)
export class ClusterRepository extends Repository<Cluster> {
  findByPublicClusterId(publicClusterId: string): Promise<Cluster | undefined> {
    return this.findOne({ publicClusterId });
  }

  findByGuildId(guildId: string): Promise<Cluster | undefined> {
    return this.findOne(
      {},
      { where: { guilds: { id: guildId } }, relations: ["guilds", "clusterUsers"] }
    );
  }
}

export function findClusterDiscordGuilds(
  cluster: Cluster,
  guilds: GuildManager
): Collection<string, DiscordGuild> {
  return guilds.cache.filter((discordGuild) =>
    cluster.guilds.some((guild) => guild.id === discordGuild.id)
  );
}
