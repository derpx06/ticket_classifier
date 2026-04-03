import dotenv from "dotenv";

dotenv.config();

const requiredVars = [
  "PORT",
  "MONGODB_URI",
] as const;

for (const key of requiredVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  port: Number(process.env.PORT || 5000),
  mongodbUri: process.env.MONGODB_URI || "",
  mongodbDbName: process.env.MONGODB_DB_NAME || "ticket_classifier",
  dbRequiredOnStartup: process.env.DB_REQUIRED_ON_STARTUP === "true",
  jwtSecret: process.env.JWT_SECRET || "change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
};
