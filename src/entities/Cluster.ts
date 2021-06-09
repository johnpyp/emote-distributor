import { Client, Collection, Guild as DiscordGuild, Util } from "discord.js";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Guild } from "./Guild";
import { ClusterUser } from "./ClusterUser";
import { ArgsError, UserError } from "../bot/util";
import { Roles } from "../bot/permissions";

@Entity()
export class Cluster extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column({ unique: true })
  public publicClusterId: string;

  @Column()
  public name: string;

  @OneToMany(() => Guild, (guild) => guild.cluster, {
    cascade: true,
    eager: true,
  })
  public guilds: Guild[];

  @OneToMany(() => ClusterUser, (clusterUser) => clusterUser.cluster, {
    cascade: true,
    eager: true,
  })
  public clusterUsers: ClusterUser[];

  @Column()
  public emoteManagersCanModerate: boolean;

  @Column()
  public enableInfo: boolean;

  @Column()
  public enableInvites: boolean;

  public getDiscordGuilds(client: Client): Collection<string, DiscordGuild> {
    return client.guilds.cache.filter((discordGuild) =>
      this.guilds.some((guild) => guild.id === discordGuild.id)
    );
  }

  public displayString(): string {
    return Util.escapeMarkdown(`${this.name} (${this.publicClusterId})`);
  }

  static async getClusterByGuild(guildId?: string): Promise<Cluster | null> {
    if (!guildId) return null;
    const cluster = await Cluster.findOne(
      {},
      {
        where: {
          guilds: {
            id: guildId,
          },
        },
        relations: ["guilds", "clusterUsers"],
      }
    );
    return cluster ?? null;
  }

  static async getClusterUserRole(clusterId: string, userId: string): Promise<Roles> {
    const clusterUser = await ClusterUser.findOne({ userId, clusterId });
    const role = clusterUser ? clusterUser.role : Roles.Anonymous;
    return role;
  }

  static async getImplicitClusterAndRoleGuard(
    guildId: string | undefined,
    userId: string
  ): Promise<ImplicitClusterAndRole> {
    if (!guildId) throw new UserError("Not a guild message ❌");
    const guild = await Guild.findOne({ id: guildId }, { relations: ["cluster"] });
    if (!guild) throw new UserError("No cluster found for this guild ❌");
    const { cluster } = guild;

    const role = await Cluster.getClusterUserRole(cluster.id, userId);
    return { cluster, role, guild };
  }

  static async getPublicClusterAndRoleGuard(
    publicClusterId: string | undefined,
    userId: string
  ): Promise<PublicClusterAndRole> {
    Cluster.publicClusterIdGuard(publicClusterId);
    const cluster = await Cluster.findOne(
      { publicClusterId },
      { relations: ["clusterUsers", "guilds"] }
    );
    if (!cluster) throw new UserError(`Cluster '${publicClusterId}' doesn't exist ❌`);

    const role = await Cluster.getClusterUserRole(cluster.id, userId);
    return { cluster, role };
  }

  static publicClusterIdGuard(
    publicClusterId: string | undefined
  ): asserts publicClusterId is string {
    if (!publicClusterId) throw new ArgsError("No cluster id provided ❌");

    if (!/^[a-z-]+$/.test(publicClusterId))
      throw new UserError("Cluster id can only contain lowercase letters and hyphens (-) ❌");
  }
}

interface ImplicitClusterAndRole {
  guild: Guild;
  cluster: Cluster;
  role: Roles;
}

interface PublicClusterAndRole {
  cluster: Cluster;
  role: Roles;
}
