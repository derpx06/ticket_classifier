import { Router } from "express";
import {
  acceptTicket,
  createTicket,
  getMyTickets,
  getTickets,
  updateTicket,
} from "../controllers/ticketsController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.use(requireAuth);
router.get("/", getTickets);
router.post("/", createTicket);
router.get("/my", getMyTickets);
router.patch("/:id", updateTicket);
router.post("/:id/accept", acceptTicket);

export default router;
