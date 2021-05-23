import {
  BaseEntity,
  Column,
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

  @Column({ unique: true })
  public publicClusterId: string;

  @Column()
  public name: string;

  @OneToMany(() => Guild, (guild) => guild.cluster, {
    cascade: ["insert", "update"],
    eager: true,
  })
  public guilds: Guild[];

  @ManyToOne(() => User, (user) => user.ownedClusters, {
    cascade: ["insert", "update"],
    onDelete: "CASCADE",
    eager: true,
  })
  public owner: User;

  @ManyToMany(() => User, (user) => user.adminClusters, {
    cascade: ["insert", "update"],
    eager: true,
  })
  @JoinTable()
  public admins: User[];

  @ManyToMany(() => User, (user) => user.moderatorClusters, {
    cascade: ["insert", "update"],
    eager: true,
  })
  @JoinTable()
  public moderators: User[];

  @Column()
  public emoteManagersCanModerate: boolean;

  @Column()
  public enableInfo: boolean;

  @Column()
  public enableInvites: boolean;

  isOwner(id: string): boolean {
    return this.owner.id === id;
  }

  isAdmin(id: string): boolean {
    return this.admins.some((user) => user.id === id) || this.isOwner(id);
  }

  isModerator(id: string): boolean {
    return this.moderators.some((user) => user.id === id) || this.isAdmin(id);
  }
}
