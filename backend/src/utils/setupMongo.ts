import { closeDbConnection, connectDb } from "../config/db";

const run = async (): Promise<void> => {
  try {
    await connectDb();
    console.log("MongoDB setup successful (connection + indexes).");
  } catch (error) {
    console.error("MongoDB setup failed:", error);
    process.exitCode = 1;
  } finally {
    await closeDbConnection();
  }
};

void run();
