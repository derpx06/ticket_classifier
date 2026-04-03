import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import { ObjectId } from "mongodb";
import { getCollections, nextSequence, type ApiKeyDoc } from "../config/db";
import { signWidgetToken } from "../utils/chatTokens";

type ChatSessionDoc = {
  _id?: ObjectId;
  sessionId: string;
  companyId: number;
  ticketId: ObjectId;
  handoffRequested: boolean;
  visitorName: string | null;
  visitorEmail: string | null;
  source: "widget";
  createdAt: Date;
  updatedAt: Date;
};

function normalizeString(value: unknown): string {
  return String(value ?? "").trim();
}

export async function getOrCreateWidgetKey(req: Request, res: Response): Promise<void> {
  try {
    if (!req.auth) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const { apiKeys } = await getCollections();
    const existingKey = await apiKeys.findOne({
      companyId: req.auth.companyId,
      label: "Website Chatbot Key",
      isActive: true,
    });

    if (!existingKey) {
      const id = await nextSequence("api_keys");
      const generatedKey = `${randomUUID().replace(/-/g, "")}${randomUUID().replace(/-/g, "")}`;
      const newApiKey: ApiKeyDoc = {
        id,
        companyId: req.auth.companyId,
        key: generatedKey,
        label: "Website Chatbot Key",
        isActive: true,
        createdAt: new Date(),
      };
      await apiKeys.insertOne(newApiKey);
      res.json({
        data: {
          widgetKey: newApiKey.key,
          label: newApiKey.label,
        },
      });
      return;
    }

    res.json({
      data: {
        widgetKey: existingKey.key,
        label: existingKey.label,
      },
    });
  } catch (error) {
    console.error("getOrCreateWidgetKey error", error);
    res.status(500).json({ message: "Failed to fetch widget key." });
  }
}

export async function createWidgetSession(req: Request, res: Response): Promise<void> {
  try {
    const widgetKey = normalizeString(req.body?.widgetKey || req.headers["x-api-key"]);
    if (!widgetKey) {
      res.status(400).json({ message: "widgetKey is required." });
      return;
    }

    const visitorName = normalizeString(req.body?.visitorName) || "Website Visitor";
    const visitorEmailRaw = normalizeString(req.body?.visitorEmail);
    const visitorEmail = visitorEmailRaw || null;
    const initialIssue = normalizeString(req.body?.issue || req.body?.initialMessage);

    const { apiKeys, users } = await getCollections();
    const db = users.db;

    const keyDoc = await apiKeys.findOne({
      key: widgetKey,
      isActive: true,
    });
    if (!keyDoc) {
      res.status(401).json({ message: "Invalid widget key." });
      return;
    }

    const now = new Date();
    const ticketDoc = {
      companyId: keyDoc.companyId,
      message: initialIssue || "Website visitor started a support chat.",
      category: "website-chat",
      priority: "medium",
      status: "pending",
      assignedTo: null as number | null,
      customerName: visitorName,
      source: "widget",
      createdAt: now,
      updatedAt: now,
    };

    const insertedTicket = await db.collection("tickets").insertOne(ticketDoc);
    const ticketObjectId = insertedTicket.insertedId;
    const sessionId = randomUUID();
    const sessionDoc: ChatSessionDoc = {
      sessionId,
      companyId: keyDoc.companyId,
      ticketId: ticketObjectId,
      handoffRequested: false,
      visitorName,
      visitorEmail,
      source: "widget",
      createdAt: now,
      updatedAt: now,
    };
    await db.collection("chat_sessions").insertOne(sessionDoc);

    if (initialIssue) {
      await db.collection("messages").insertOne({
        ticketId: ticketObjectId,
        companyId: keyDoc.companyId,
        sessionId,
        sender: "user",
        text: initialIssue,
        createdAt: now,
        updatedAt: now,
      });
    }

    const chatToken = signWidgetToken({
      companyId: keyDoc.companyId,
      sessionId,
      ticketId: ticketObjectId.toString(),
    });

    res.status(201).json({
      data: {
        sessionId,
        ticketId: ticketObjectId.toString(),
        chatToken,
        handoffRequested: false,
      },
    });
  } catch (error) {
    console.error("createWidgetSession error", error);
    res.status(500).json({ message: "Failed to create widget chat session." });
  }
}
