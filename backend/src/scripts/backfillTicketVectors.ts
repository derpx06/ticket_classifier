import { getCollections } from "../config/db";
import { ensureTicketsCollection } from "../config/qdrant";
import { ticketVectorService } from "../services/TicketVectorService";

async function run(): Promise<void> {
  await ensureTicketsCollection();

  const reindexAll = process.argv.includes("--all");

  const { users } = await getCollections();
  const db = users.db;

  const cursor = reindexAll
    ? db.collection("tickets").find({})
    : db.collection("tickets").find({ vectorizedAt: { $exists: false } });
  const batch: Array<{
    ticketId: string;
    companyId: number;
    message: string;
    category?: string;
    priority?: string;
    customerName?: string;
  }> = [];

  const flush = async () => {
    if (batch.length === 0) return;
    await ticketVectorService.upsertTickets(batch);
    batch.length = 0;
  };

  while (await cursor.hasNext()) {
    const ticket = await cursor.next();
    if (!ticket) break;
    const id = String(ticket._id);
    batch.push({
      ticketId: id,
      companyId: Number(ticket.companyId),
      message: String(ticket.message || ""),
      category: ticket.category,
      priority: ticket.priority,
      customerName: ticket.customerName,
    });
    if (batch.length >= 50) {
      await flush();
    }
  }

  await flush();

  if (!reindexAll) {
    const now = new Date();
    await db.collection("tickets").updateMany(
      { vectorizedAt: { $exists: false } },
      { $set: { vectorizedAt: now } },
    );
  }
  console.log("Ticket vector backfill completed.");
}

run().catch((error) => {
  console.error("Ticket vector backfill failed:", error);
  process.exit(1);
});
