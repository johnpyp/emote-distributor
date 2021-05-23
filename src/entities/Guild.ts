import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Cluster } from "./Cluster";

@Entity()
export class Guild extends BaseEntity {
  @PrimaryColumn()
  public id: string;

  @ManyToOne(() => Cluster, (cluster) => cluster.guilds)
  public cluster: Cluster;

  @Column({ type: "date", nullable: true })
  public lastRefreshed?: Date;
}
