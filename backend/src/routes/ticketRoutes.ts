import { Router } from "express";
import {
  acceptTicket,
  createMessage,
  createTicket,
  getMessagesByTicket,
  getMyTickets,
  getTickets,
  searchTickets,
  updateTicket,
} from "../controllers/ticketsController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.use(requireAuth);
router.get("/", getTickets);
router.get("/search", searchTickets);
router.post("/", createTicket);
router.get("/my", getMyTickets);
router.get("/:id/messages", getMessagesByTicket);
router.post("/:id/messages", createMessage);
router.patch("/:id", updateTicket);
router.post("/:id/accept", acceptTicket);

export default router;
