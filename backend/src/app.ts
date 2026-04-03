import express from "express";
import cors from "cors";
import healthRoutes from "./routes/healthRoutes";
import authRoutes from "./routes/authRoutes";
import teamRoutes from "./routes/teamRoutes";
import ragRoutes from "./routes/ragRoutes";
import ticketRoutes from "./routes/ticketRoutes";
import messageRoutes from "./routes/messageRoutes";

export function createApp(): express.Application {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api", healthRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/teams", teamRoutes);
  app.use("/api/rag", ragRoutes);
  app.use("/api/tickets", ticketRoutes);
  app.use("/api/messages", messageRoutes);


  return app;
}
