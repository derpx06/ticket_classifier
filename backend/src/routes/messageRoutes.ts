import { Router } from "express";
import { createMessage, getMessagesByTicket } from "../controllers/messagesController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.use(requireAuth);
router.get("/:ticketId", getMessagesByTicket);
router.post("/", createMessage);

export default router;
