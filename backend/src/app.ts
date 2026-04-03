import express from "express";
import cors from "cors";
import healthRoutes from "./routes/healthRoutes";
import authRoutes from "./routes/authRoutes";
import teamRoutes from "./routes/teamRoutes";

export function createApp(): express.Application {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api", healthRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/teams", teamRoutes);

  return app;
}
