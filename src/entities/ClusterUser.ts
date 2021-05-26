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

  @ManyToOne(() => User, (user) => user.clusterUsers)
  public user!: User;

  @ManyToOne(() => Cluster, (cluster) => cluster.clusterUsers)
  public cluster!: User;

  @Column({ type: "text" })
  public role: Roles;
}
