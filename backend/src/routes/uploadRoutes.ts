import { Router } from "express";
import { uploadChatImageHandler } from "../controllers/uploadController";

const router = Router();

router.post("/chat-image", uploadChatImageHandler);

export default router;
