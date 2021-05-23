import {
  BaseEntity,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Guild } from "./Guild";
import { User } from "./User";

@Entity()
export class Cluster extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @OneToMany(() => Guild, (guild) => guild.cluster)
  public guilds: Guild[];

  @ManyToOne(() => User, (user) => user.ownedClusters)
  public owner: User;

  @ManyToMany(() => User, (user) => user.adminClusters)
  @JoinTable()
  public admins: User[];

  @ManyToMany(() => User, (user) => user.moderatorClusters)
  @JoinTable()
  public moderators: User[];
}
