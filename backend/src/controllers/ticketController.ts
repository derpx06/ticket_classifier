import { Request, Response } from "express";
import { Ticket } from "../models/ticket.model";
import { Message } from "../models/message.model";
import { Company } from "../models/company.model";

export const createTicket = async (req: Request, res: Response) => {
  try {
    const { apiKey, message, chatHistory } = req.body;

    // 1. Find company
    const company = await Company.findOne({ apiKey });
    if (!company) {
      return res.status(401).json({ message: "Invalid API key" });
    }

    // 2. Create ticket
    const ticket = await Ticket.create({
      companyId: company._id,
      message,
      category: "other",
      priority: "medium",
    });

    // 3. Save chat history
    if (chatHistory?.length) {
      const msgs = chatHistory.map((m: any) => ({
        ticketId: ticket._id,
        sender: m.role,
        text: m.text,
      }));

      await Message.insertMany(msgs);
    }

    return res.json({ ticketId: ticket._id });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};