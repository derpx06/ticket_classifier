import { connectDb } from "../config/db";

/**
 * Backward-compatible entrypoint used by startup and middleware.
 * For MongoDB, this ensures a successful DB connection and index setup.
 */
export async function ensureCompanyTeamsSchema(): Promise<void> {
  try {
    await connectDb();
    console.log("MongoDB connection/index setup OK");
  } catch (e) {
    console.error("ensureCompanyTeamsSchema failed:", e);
    throw e;
  }
}
