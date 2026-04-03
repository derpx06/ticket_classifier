import { createServer } from "http";
import { env } from "./config/env";
import { testDbConnection } from "./config/db";
import { ensureCompanyTeamsSchema } from "./db/ensureCompanyTeamsSchema";
import { createApp } from "./app";
import { createChatSocketServer } from "./services/chatSocketServer";

const app = createApp();
const httpServer = createServer(app);
createChatSocketServer(httpServer);

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

  // httpServer.listen(env.port, () => {
  //   console.log(`API listening at http://127.0.0.1:${env.port}/api (PORT from .env; Vite dev proxy must match)`);
  // });
  httpServer.listen(env.port, '0.0.0.0', () => {
    console.log('Server running');
  });
};

void startServer();
