import { assert } from "console";

export const appConfig = {
  BOT_TOKEN: process.env.BOT_TOKEN as string,
  SQLITE_PATH: process.env.SQLITE_PATH || "data/db/db.sqlite3",
};

assert(!!appConfig.BOT_TOKEN);
assert(!!appConfig.SQLITE_PATH);
