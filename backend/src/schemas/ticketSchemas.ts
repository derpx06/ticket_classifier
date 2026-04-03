import { z } from "zod";

const optionalEnum = <T extends [string, ...string[]]>(values: T) =>
  z
    .enum(values)
    .optional()
    .transform((v) => (v === undefined ? undefined : v));

export const createTicketSchema = z.object({
  apiKey: z.string().trim().uuid("Valid company API key (UUID) is required"),

  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(2000, "Message too long"),

  // optional → AI will fill
  category: optionalEnum(["billing", "technical", "login", "other"]),

  priority: optionalEnum(["low", "medium", "high", "critical"]),

  urgency: optionalEnum(["low", "medium", "high", "critical"]),

  chatHistory: z
    .array(
      z.object({
        role: z.enum(["user", "bot"]),
        text: z.string().trim().min(1),
      })
    )
    .optional(),
});
