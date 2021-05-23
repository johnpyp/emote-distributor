import { BaseEntity, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Cluster } from "./Cluster";

@Entity()
export class User extends BaseEntity {
  @PrimaryColumn()
  public id: string;

  @ManyToOne(() => Cluster, (cluster) => cluster.owner)
  public ownedClusters: Cluster[];

  @ManyToOne(() => Cluster, (cluster) => cluster.admins)
  public adminClusters: Cluster[];

  @ManyToOne(() => Cluster, (cluster) => cluster.moderators)
  public moderatorClusters: Cluster[];

  static async findOrCreate(authorId: string): Promise<User> {
    const foundUser = await User.findOne(authorId);
    if (foundUser) return foundUser;

    const user = await User.create({
      id: authorId,
    }).save();
    return user;
  }
}
