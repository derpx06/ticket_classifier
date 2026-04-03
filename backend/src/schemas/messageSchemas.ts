import { z } from "zod";

const optionalObjectId = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" || v === undefined ? undefined : v));

export const createMessageSchema = z.object({
  ticketId: z
    .string()
    .trim()
    .min(1, "Ticket ID is required"),

  sender: z.enum(["user", "bot", "agent"]),

  text: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(2000, "Message too long"),
});

export const updateMessageSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1)
    .max(2000)
    .optional(),

  sender: z.enum(["user", "bot", "agent"]).optional(),

  ticketId: optionalObjectId,
});