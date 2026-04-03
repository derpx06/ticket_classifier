import express from "express";
import cors from "cors";
import path from "path";


import healthRoutes from "./routes/healthRoutes";
import authRoutes from "./routes/authRoutes";
import teamRoutes from "./routes/teamRoutes";
import ragRoutes from "./routes/ragRoutes";
import ticketRoutes from "./routes/ticketRoutes";

export function createApp(): express.Application {
  const app = express();

  app.use(cors({ origin: '*' })); // Allow embedding on any site
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "../public")));


  app.use("/api", healthRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/teams", teamRoutes);
  app.use("/api/rag", ragRoutes);
  app.use("/api/tickets", ticketRoutes);


  return app;
}
