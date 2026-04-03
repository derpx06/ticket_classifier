import express from "express";
import cors from "cors";
import path from "path";


import healthRoutes from "./routes/healthRoutes";
import authRoutes from "./routes/authRoutes";
import teamRoutes from "./routes/teamRoutes";
import ragRoutes from "./routes/ragRoutes";
import ticketRoutes from "./routes/ticketRoutes";
import widgetRoutes from "./routes/widgetRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import { createTicket } from "./controllers/ticketsController";

export function createApp(): express.Application {
  const app = express();

  app.use(cors({ origin: '*' })); // Allow embedding on any site
  app.use(express.json({ limit: "10mb" }));
  app.use(express.static(path.join(__dirname, "../public")));


  app.use("/api", healthRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/teams", teamRoutes);
  app.use("/api/rag", ragRoutes);
  app.post("/api/createTicket", createTicket);
  app.use("/api/tickets", ticketRoutes);
  app.use("/api/widget", widgetRoutes);
  app.use("/api/uploads", uploadRoutes);


  return app;
}
