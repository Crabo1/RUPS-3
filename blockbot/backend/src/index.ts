import { makeApp } from "./app";
import { getConfig } from "./config";
import { applyMigrations } from "./database/migrate";
import { seedDatabase } from "./database/seed";
import { makeQueries } from "./database/queries";
import { makeLogger } from "./logger";
import { makeMiddleware } from "./middleware";

async function main() {
  const config = getConfig();

  await applyMigrations(config.databaseUrl, "up");
  await seedDatabase(config.databaseUrl);
  const logger = makeLogger();
  const queries = makeQueries(config.databaseUrl);
  const middleware = makeMiddleware(logger);
  const app = makeApp({ queries, middleware });

  app.listen(config.port, () => {
    logger.info(`Server is up on port ${config.port}`);
  });
}

main().catch((error) => {
  console.log(error);
  process.exit(1);
});
