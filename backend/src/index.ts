import { env } from "./config/env";
import { testDbConnection } from "./config/db";
import { ensureCompanyTeamsSchema } from "./db/ensureCompanyTeamsSchema";
import { createApp } from "./app";

const app = createApp();

const startServer = async (): Promise<void> => {
  try {
    await testDbConnection();
    await ensureCompanyTeamsSchema();
    console.log("Database connection successful");
  } catch (error) {
    if (env.dbRequiredOnStartup) {
      console.error("Failed to start server: database is required but unavailable.", error);
      process.exit(1);
    }
    console.warn("Database unavailable at startup. Server will run, but DB-backed routes may fail.");
    console.warn(error);
  }

  app.listen(env.port, () => {
    console.log(`API listening at http://127.0.0.1:${env.port}/api (PORT from .env; Vite dev proxy must match)`);
  });
};

void startServer();
