import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { getCollections } from "../config/db";

function parseObjectId(id: string): ObjectId | null {
  if (!ObjectId.isValid(id)) return null;
  return new ObjectId(id);
}

function getIdParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export async function getMessagesByTicket(req: Request, res: Response): Promise<void> {
  try {
    if (!req.auth) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const ticketObjectId = parseObjectId(getIdParam(req.params.ticketId));
    if (!ticketObjectId) {
      res.status(400).json({ message: "Invalid ticket id." });
      return;
    }

    const { users } = await getCollections();
    const db = users.db;
    const ticket = await db.collection("tickets").findOne({
      _id: ticketObjectId,
      companyId: req.auth.companyId,
    });
    if (!ticket) {
      res.status(404).json({ message: "Ticket not found." });
      return;
    }

    const messages = await db
      .collection("messages")
      .find({ ticketId: ticketObjectId, companyId: req.auth.companyId })
      .sort({ createdAt: 1 })
      .toArray();

    res.json({ data: messages });
  } catch (error) {
    console.error("getMessagesByTicket error", error);
    res.status(500).json({ message: "Failed to fetch messages." });
  }
}

export async function createMessage(req: Request, res: Response): Promise<void> {
  try {
    if (!req.auth) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const ticketObjectId = parseObjectId(String(req.body?.ticketId ?? ""));
    if (!ticketObjectId) {
      res.status(400).json({ message: "Invalid ticket id." });
      return;
    }

    const sender = String(req.body?.sender ?? "").trim().toLowerCase();
    if (!["user", "bot", "agent"].includes(sender)) {
      res.status(400).json({ message: "Invalid sender value." });
      return;
    }

    const text = String(req.body?.text ?? "").trim();
    if (!text) {
      res.status(400).json({ message: "Message text is required." });
      return;
    }

    const { users } = await getCollections();
    const db = users.db;
    const ticket = await db.collection("tickets").findOne({
      _id: ticketObjectId,
      companyId: req.auth.companyId,
    });
    if (!ticket) {
      res.status(404).json({ message: "Ticket not found." });
      return;
    }

    const now = new Date();
    const payload = {
      ticketId: ticketObjectId,
      companyId: req.auth.companyId,
      sender,
      text,
      createdAt: now,
      updatedAt: now,
    };

    const inserted = await db.collection("messages").insertOne(payload);
    await db.collection("tickets").updateOne(
      { _id: ticketObjectId, companyId: req.auth.companyId },
      { $set: { updatedAt: now } }
    );

    res.status(201).json({
      data: {
        _id: inserted.insertedId,
        ...payload,
      },
    });
  } catch (error) {
    console.error("createMessage error", error);
    res.status(500).json({ message: "Failed to send message." });
  }
}
