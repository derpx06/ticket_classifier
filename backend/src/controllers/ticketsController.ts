import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { getCollections } from "../config/db";
import { createTicketSchema } from "../schemas/ticketSchemas";
import { emitRealtimeTicketStatusFromHttp } from "../services/chatSocketServer";

type TicketStatus = "pending" | "assigned" | "resolved" | "escalated";
type TicketPriority = "low" | "medium" | "high";
type TicketCategory = "billing" | "technical" | "login" | "other";

const STATUS_VALUES: TicketStatus[] = ["pending", "assigned", "resolved", "escalated"];
const PRIORITY_VALUES: TicketPriority[] = ["low", "medium", "high"];
const CATEGORY_VALUES: TicketCategory[] = ["billing", "technical", "login", "other"];

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

function normalizeCategory(value: unknown): TicketCategory | null {
  const normalized = String(value ?? "").trim().toLowerCase();
  return CATEGORY_VALUES.includes(normalized as TicketCategory)
    ? (normalized as TicketCategory)
    : null;
}

type CreateTicketInput = {
  apiKey: string;
  message: string;
  category?: string;
  priority?: string;
  urgency?: string;
  chatHistory?: Array<{ role: "user" | "bot"; text: string }>;
};

async function insertTicketFromInput(
  input: CreateTicketInput,
  customerNameRaw: unknown,
): Promise<{ ticketId: ObjectId; ticketDoc: Record<string, unknown> }> {
  const now = new Date();
  const { companies, users } = await getCollections();
  const db = users.db;

  const uuidNorm = input.apiKey.trim().toLowerCase();
  const company = await companies.findOne({ uuid: uuidNorm }, { projection: { _id: 0, id: 1, uuid: 1 } });
  if (!company) {
    throw new Error("No company found for that API key (UUID).");
  }

  const targetCompanyId = company.id;

  const ticketDoc = {
    companyId: targetCompanyId,
    message: input.message,
    category: normalizeCategory(input.category) ?? "other",
    priority: normalizePriority(input.priority) ?? "medium",
    urgency: normalizePriority(input.urgency) ?? "medium",
    status: "pending" as TicketStatus,
    assignedTo: null as number | null,
    customerName: String(customerNameRaw ?? "Test Customer").trim() || "Test Customer",
    createdAt: now,
    updatedAt: now,
  };

  const inserted = await db.collection("tickets").insertOne(ticketDoc);
  const ticketId = inserted.insertedId;

  const seedMessages =
    Array.isArray(input.chatHistory) && input.chatHistory.length > 0
      ? input.chatHistory.map((entry, index) => {
          const createdAt = new Date(now.getTime() + index);
          return {
            ticketId,
            companyId: targetCompanyId,
            sender: entry.role,
            text: entry.text,
            createdAt,
            updatedAt: createdAt,
          };
        })
      : [
          {
            ticketId,
            companyId: targetCompanyId,
            sender: "user",
            text: input.message,
            createdAt: now,
            updatedAt: now,
          },
        ];

  await db.collection("messages").insertMany(seedMessages);

  return { ticketId, ticketDoc };
}

export async function createTicket(req: Request, res: Response): Promise<void> {
  try {
    const parsed = createTicketSchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      res.status(400).json({ message: first?.message ?? "Invalid ticket payload." });
      return;
    }
    const { ticketId, ticketDoc } = await insertTicketFromInput(parsed.data, req.body?.customerName);

    res.status(201).json({
      data: {
        _id: ticketId,
        ...ticketDoc,
      },
    });
  } catch (error) {
    console.error("createTicket error", error);
    res.status(500).json({ message: "Failed to create ticket." });
  }
}

export async function getMessagesByTicket(req: Request, res: Response): Promise<void> {
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

    const ticketObjectId = parseObjectId(getIdParam(req.params.id));
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
      { $set: { updatedAt: now } },
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

    const chatSession = await db.collection("chat_sessions").findOne(
      { companyId: req.auth.companyId, ticketId: ticketObjectId },
      { projection: { _id: 0, sessionId: 1 } },
    );
    const status = normalizeStatus(result.status) || "pending";
    emitRealtimeTicketStatusFromHttp({
      companyId: req.auth.companyId,
      ticketId: ticketObjectId.toString(),
      sessionId: chatSession?.sessionId ?? null,
      status,
      assignedTo: typeof result.assignedTo === "number" ? result.assignedTo : null,
    });

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

    const chatSession = await db.collection("chat_sessions").findOne(
      { companyId: req.auth.companyId, ticketId: ticketObjectId },
      { projection: { _id: 0, sessionId: 1 } },
    );
    emitRealtimeTicketStatusFromHttp({
      companyId: req.auth.companyId,
      ticketId: ticketObjectId.toString(),
      sessionId: chatSession?.sessionId ?? null,
      status: "assigned",
      assignedTo: req.auth.userId,
    });

    res.json({ data: result });
  } catch (error) {
    console.error("acceptTicket error", error);
    res.status(500).json({ message: "Failed to accept ticket." });
  }
}
