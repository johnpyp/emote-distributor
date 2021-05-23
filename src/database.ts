import { Connection, createConnection } from "typeorm";
import { appConfig } from "./app-config";
import { Cluster } from "./entities/Cluster";
import { Guild } from "./entities/Guild";
import { User } from "./entities/User";

export async function initializeDatabase(): Promise<Connection> {
  return createConnection({
    type: "sqlite",
    database: appConfig.SQLITE_PATH,
    synchronize: true,
    migrationsRun: false,
    logging: false,
    enableWAL: true,

    entities: [Guild, Cluster, User],
  });
}
