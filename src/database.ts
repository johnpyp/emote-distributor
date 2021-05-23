import { Connection, createConnection } from "typeorm";
import { appConfig } from "./app-config";
import { Guild } from "./entities/Guild";

export async function createDatabase(): Promise<Connection> {
  return createConnection({
    type: "sqlite",
    database: appConfig.SQLITE_PATH,
    synchronize: true,
    migrationsRun: false,
    logging: false,
    enableWAL: true,

    entities: [Guild],
  });
}
