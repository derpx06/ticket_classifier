import { Router } from "express";
import {
  createWidgetSession,
  getOrCreateWidgetKey,
  getWidgetKeyFromApiKey,
} from "../controllers/widgetController";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.post("/session", createWidgetSession);
router.post("/key", getWidgetKeyFromApiKey);
router.get("/config", requireAuth, requireAdmin, getOrCreateWidgetKey);

export default router;
