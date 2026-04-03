import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { getCollections } from "../config/db";

type TicketStatus = "pending" | "assigned" | "resolved" | "escalated";
type TicketPriority = "low" | "medium" | "high";

const STATUS_VALUES: TicketStatus[] = ["pending", "assigned", "resolved", "escalated"];
const PRIORITY_VALUES: TicketPriority[] = ["low", "medium", "high"];

function parseObjectId(id: string): ObjectId | null {
  if (!ObjectId.isValid(id)) return null;
  return new ObjectId(id);
}

function getIdParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function normalizeStatus(value: unknown): TicketStatus | null {
  const normalized = String(value ?? "").trim().toLowerCase();
  return STATUS_VALUES.includes(normalized as TicketStatus) ? (normalized as TicketStatus) : null;
}

function normalizePriority(value: unknown): TicketPriority | null {
  const normalized = String(value ?? "").trim().toLowerCase();
  return PRIORITY_VALUES.includes(normalized as TicketPriority)
    ? (normalized as TicketPriority)
    : null;
}

export async function createTicket(req: Request, res: Response): Promise<void> {
  try {
    if (!req.auth) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const message = String(req.body?.message ?? "").trim();
    if (!message) {
      res.status(400).json({ message: "Message is required." });
      return;
    }

    const category = String(req.body?.category ?? "other").trim().toLowerCase();
    const priority = normalizePriority(req.body?.priority ?? "medium");
    if (!priority) {
      res.status(400).json({ message: "Invalid priority value." });
      return;
    }

    const now = new Date();
    const ticketDoc = {
      companyId: req.auth.companyId,
      message,
      category: category || "other",
      priority,
      status: "pending" as TicketStatus,
      assignedTo: null as number | null,
      customerName: String(req.body?.customerName ?? "Test Customer").trim() || "Test Customer",
      createdAt: now,
      updatedAt: now,
    };

    const { users } = await getCollections();
    const db = users.db;
    const inserted = await db.collection("tickets").insertOne(ticketDoc);

    res.status(201).json({
      data: {
        _id: inserted.insertedId,
        ...ticketDoc,
      },
    });
  } catch (error) {
    console.error("createTicket error", error);
    res.status(500).json({ message: "Failed to create ticket." });
  }
}

export async function getTickets(req: Request, res: Response): Promise<void> {
  try {
    if (!req.auth) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const { users } = await getCollections();
    const db = users.db;
    const tickets = await db
      .collection("tickets")
      .find({ companyId: req.auth.companyId })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ data: tickets });
  } catch (error) {
    console.error("getTickets error", error);
    res.status(500).json({ message: "Failed to fetch tickets." });
  }
}

export async function getMyTickets(req: Request, res: Response): Promise<void> {
  try {
    if (!req.auth) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const { users } = await getCollections();
    const db = users.db;
    const tickets = await db
      .collection("tickets")
      .find({
        companyId: req.auth.companyId,
        assignedTo: req.auth.userId,
      })
      .sort({ updatedAt: -1 })
      .toArray();

    res.json({ data: tickets });
  } catch (error) {
    console.error("getMyTickets error", error);
    res.status(500).json({ message: "Failed to fetch assigned tickets." });
  }
}

export async function updateTicket(req: Request, res: Response): Promise<void> {
  try {
    if (!req.auth) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const ticketObjectId = parseObjectId(getIdParam(req.params.id));
    if (!ticketObjectId) {
      res.status(400).json({ message: "Invalid ticket id." });
      return;
    }

    const updates: Record<string, unknown> = {};
    if (req.body?.status !== undefined) {
      const status = normalizeStatus(req.body.status);
      if (!status) {
        res.status(400).json({ message: "Invalid status value." });
        return;
      }
      updates.status = status;
    }
    if (req.body?.priority !== undefined) {
      const priority = normalizePriority(req.body.priority);
      if (!priority) {
        res.status(400).json({ message: "Invalid priority value." });
        return;
      }
      updates.priority = priority;
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ message: "Provide status and/or priority to update." });
      return;
    }

    updates.updatedAt = new Date();

    const { users } = await getCollections();
    const db = users.db;
    const result = await db.collection("tickets").findOneAndUpdate(
      { _id: ticketObjectId, companyId: req.auth.companyId },
      { $set: updates },
      { returnDocument: "after" }
    );

    if (!result) {
      res.status(404).json({ message: "Ticket not found." });
      return;
    }

    res.json({ data: result });
  } catch (error) {
    console.error("updateTicket error", error);
    res.status(500).json({ message: "Failed to update ticket." });
  }
}

export async function acceptTicket(req: Request, res: Response): Promise<void> {
  try {
    if (!req.auth) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const ticketObjectId = parseObjectId(getIdParam(req.params.id));
    if (!ticketObjectId) {
      res.status(400).json({ message: "Invalid ticket id." });
      return;
    }

    const { users } = await getCollections();
    const db = users.db;
    const now = new Date();

    const result = await db.collection("tickets").findOneAndUpdate(
      {
        _id: ticketObjectId,
        companyId: req.auth.companyId,
        status: "pending",
      },
      {
        $set: {
          status: "assigned",
          assignedTo: req.auth.userId,
          updatedAt: now,
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      res.status(404).json({ message: "Pending ticket not found." });
      return;
    }

    res.json({ data: result });
  } catch (error) {
    console.error("acceptTicket error", error);
    res.status(500).json({ message: "Failed to accept ticket." });
  }
}
