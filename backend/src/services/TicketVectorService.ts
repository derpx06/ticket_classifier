import { v4 as uuidv4 } from "uuid";
import { qdrant, TICKETS_COLLECTION_NAME, ensureTicketsCollection } from "../config/qdrant";
import { LocalEmbeddings } from "./LocalEmbeddings";

type TicketVectorInput = {
  ticketId: string;
  companyId: number;
  message: string;
  category?: string;
  priority?: string;
  customerName?: string;
};

export class TicketVectorService {
  private embeddings: LocalEmbeddings;
  private ready = false;

  constructor() {
    this.embeddings = new LocalEmbeddings();
  }

  private async init(): Promise<void> {
    if (!this.ready) {
      await ensureTicketsCollection();
      try {
        await qdrant.createPayloadIndex(TICKETS_COLLECTION_NAME, {
          field_name: "companyId",
          field_schema: "integer",
        });
      } catch (error) {
        // ignore if index already exists
      }
      this.ready = true;
    }
  }

  private buildText(input: TicketVectorInput): string {
    const category = input.category ? `Category: ${input.category}` : "";
    const priority = input.priority ? `Priority: ${input.priority}` : "";
    const customer = input.customerName ? `Customer: ${input.customerName}` : "";
    return [input.message, category, priority, customer].filter(Boolean).join("\n");
  }

  async upsertTicket(input: TicketVectorInput): Promise<void> {
    await this.init();
    const vector = await this.embeddings.embedQuery(this.buildText(input));
    await qdrant.upsert(TICKETS_COLLECTION_NAME, {
      points: [
        {
          id: uuidv4(),
          vector,
          payload: {
            ticketId: input.ticketId,
            companyId: input.companyId,
            message: input.message,
            category: input.category ?? null,
            priority: input.priority ?? null,
            customerName: input.customerName ?? null,
          },
        },
      ],
      wait: true,
    });
  }

  async upsertTickets(inputs: TicketVectorInput[]): Promise<void> {
    if (inputs.length === 0) return;
    await this.init();
    const texts = inputs.map((input) => this.buildText(input));
    const vectors = await this.embeddings.embedDocuments(texts);
    const points = inputs.map((input, idx) => ({
      id: uuidv4(),
      vector: vectors[idx],
      payload: {
        ticketId: input.ticketId,
        companyId: input.companyId,
        message: input.message,
        category: input.category ?? null,
        priority: input.priority ?? null,
        customerName: input.customerName ?? null,
      },
    }));
    await qdrant.upsert(TICKETS_COLLECTION_NAME, { points, wait: true });
  }

  async searchTickets(companyId: number, query: string, limit = 20) {
    await this.init();
    const vector = await this.embeddings.embedQuery(query);
    const results = await qdrant.search(TICKETS_COLLECTION_NAME, {
      vector,
      limit,
      with_payload: true,
      filter: {
        must: [
          {
            key: "companyId",
            match: { value: companyId },
          },
        ],
      },
    });

    return results.map((item) => ({
      ticketId: String(item.payload?.ticketId || item.id),
      score: item.score ?? 0,
    }));
  }
}

export const ticketVectorService = new TicketVectorService();
