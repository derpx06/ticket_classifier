import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { getCollections } from "../config/db";
import { uploadChatImage } from "../services/CloudinaryImages";

type TokenPayload = {
  sub: number;
  companyId: number;
  role: string;
};

const resolveCompanyId = async (req: Request): Promise<number | null> => {
  if (req.auth?.companyId) {
    return req.auth.companyId;
  }

  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    const token = header.slice(7);
    try {
      const decoded = jwt.verify(token, env.jwtSecret) as unknown as TokenPayload;
      return decoded.companyId;
    } catch {
      return null;
    }
  }

  const widgetKey = String(req.body?.widgetKey || req.headers["x-api-key"] || "").trim();
  if (!widgetKey) {
    return null;
  }
  const { apiKeys } = await getCollections();
  const keyDoc = await apiKeys.findOne({ key: widgetKey, isActive: true });
  if (!keyDoc) {
    return null;
  }
  return keyDoc.companyId;
};

export async function uploadChatImageHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyId = await resolveCompanyId(req);
    if (!companyId) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const dataUrl = String(req.body?.dataUrl || "").trim();
    const fileName = String(req.body?.fileName || "upload.png").trim();
    if (!dataUrl) {
      res.status(400).json({ message: "Image data is required." });
      return;
    }

    const upload = await uploadChatImage({ dataUrl, fileName });
    res.json({
      data: {
        url: upload.url,
        variants: upload.variants || [],
        id: upload.id,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload image.";
    res.status(500).json({ message });
  }
}
