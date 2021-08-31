import { EntityRepository, Repository } from "typeorm";
import { ClusterUser } from "../entities/ClusterUser";

@EntityRepository(ClusterUser)
export class ClusterUserRepository extends Repository<ClusterUser> {
  findByClusterAndUser({
    userId,
    clusterId,
  }: {
    userId: string;
    clusterId: string;
  }): Promise<ClusterUser | undefined> {
    return this.findOne({ userId, clusterId }, { relations: ["user", "cluster"] });
  }

  findByPublicClusterAndUser({
    userId,
    publicClusterId,
  }: {
    userId: string;
    publicClusterId: string;
  }): Promise<ClusterUser | undefined> {
    return this.findOne(
      { userId },
      { where: { cluster: { publicClusterId } }, relations: ["user", "cluster"] }
    );
  }
}
