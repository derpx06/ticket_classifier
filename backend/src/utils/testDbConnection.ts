import { closeDbConnection, testDbConnection } from "../config/db";

const run = async (): Promise<void> => {
  try {
    await testDbConnection();
    console.log("Database test query successful");
  } catch (error) {
    console.error("Database test query failed:", error);
    process.exitCode = 1;
  } finally {
    await closeDbConnection();
  }
};

void run();
