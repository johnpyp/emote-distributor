import "reflect-metadata";
import { Bot } from "./bot/index";
import { appConfig } from "./app-config";
import { initializeDatabase } from "./database";

async function main() {
  await initializeDatabase();
  await Bot.create(appConfig.BOT_TOKEN);
}

main().catch(console.error);

process.on("unhandledRejection", (reason, p) => {
  console.error("Unhandled Rejection at: ", p);
  process.exit(1);
  // application specific logging, throwing an error, or other logic here
});
