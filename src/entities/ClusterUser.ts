import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Roles } from "../bot/permissions";
import { Cluster } from "./Cluster";
import { User } from "./User";

@Entity()
export class ClusterUser extends BaseEntity {
  @PrimaryColumn()
  public userId: string;

  @PrimaryColumn()
  public clusterId: string;

  @ManyToOne(() => User, (user) => user.clusterUsers, { onDelete: "CASCADE" })
  public user!: User;

  @ManyToOne(() => Cluster, (cluster) => cluster.clusterUsers, { onDelete: "CASCADE" })
  public cluster!: User;

  @Column({ type: "text" })
  public role: Roles;
}
