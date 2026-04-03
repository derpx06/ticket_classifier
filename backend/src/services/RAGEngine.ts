import Groq from "groq-sdk";
import { Document as LangChainDocument } from "@langchain/core/documents";
import { getCollections } from "../config/db";
import { indexerService } from "./Indexer";
import dotenv from "dotenv";





dotenv.config();

export class RAGEngine {
    private groq: Groq;
    private modelName: string;
    private historyByCompany: Map<number, Array<{ role: "user" | "assistant"; content: string }>> = new Map();
    private readonly MAX_CONTEXT_MESSAGES = 30;

    constructor() {
        if (!process.env.GROQ_API_KEY) {
            throw new Error("GROQ_API_KEY is required for RAGEngine.");
        }
        this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        this.modelName = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
    }




    async answerTicket(query: string, _sessionId: string = "default", companyId?: number) {
        const historyKey = Number(companyId ?? 1);
        // 1. Q&A Mapping (Fast track)
        if (companyId) {
            const { questions } = await getCollections() as any;
            if (questions) {
                const qaResult = await questions.findOne({
                    companyId: companyId,
                    question: { $regex: new RegExp(query, 'i') },
                    isActive: true
                });

                if (qaResult) {
                    const qaSources = [{ url: "Internal", title: "Pre-defined Q&A" }];
                    const qaAnswer = this.appendSources(String(qaResult.answer || ""), qaSources);
                    return {
                        answer: qaAnswer,
                        sources: qaSources,
                        type: "qa-match"
                    };
                }
            }
        }


        // 2. Retrieve relevant context
        const contextDocs: LangChainDocument[] = await indexerService.similaritySearch(query, 8);
        const rankedDocs = this.rankDocsForQuery(query, contextDocs);

        // simple relevance grading (threshold check)
        const filteredDocs = rankedDocs.filter(doc => (doc.metadata.score ?? 1) > 0.55).slice(0, 5);
        const sourceDocs = (filteredDocs.length > 0 ? filteredDocs : rankedDocs.slice(0, 3));
        const sources = this.buildSources(sourceDocs);
        const contextText = filteredDocs.map((doc: LangChainDocument) => doc.pageContent).join('\n\n');

        // 3. Retrieve Sitemap for navigation guidance
        let sitemapText = "No sitemap available.";
        let sitemapPages: Array<{ url: string; title: string }> = [];
        if (companyId) {
            try {
                const { sitemaps } = await getCollections();
                const sitemapDoc = await sitemaps.findOne({ companyId });
                if (sitemapDoc) {
                    sitemapPages = Array.isArray(sitemapDoc.pages) ? sitemapDoc.pages : [];
                    sitemapText = sitemapDoc.pages.map(p => `- ${p.title}: ${p.url}`).join('\n');
                }
            } catch (err) {
                console.error("[RAGEngine] Sitemap fetch error:", err);
            }
        }

        // 4. Conversation History
        const chatHistory = this.historyByCompany.get(historyKey) || [];
        const historyText = chatHistory
            .slice(-this.MAX_CONTEXT_MESSAGES)
            .map(m => `${m.role}: ${m.content}`)
            .join('\n');

        // 5. Define prompt
        const prompt = `
You are a friendly and proactive Support Chatbot for our website.
Your goal is to help the user find answers and navigate the site effectively.

PERSONA:
- Be empathetic, professional, and concise.
- If you find the answer in the Context, provide it clearly.
- If the answer is not in the context, look at the Sitemap and suggest pages that might be relevant.
- If you are still unsure, suggest they contact a human support agent.
- NEVER make up facts or URLs.
FORMAT:
- Respond in clean Markdown (MDX-friendly).
- Use short headings and bullet lists when helpful.
- Do NOT add a references section or invent sources. References will be attached automatically.

SITEMAP (Use this to guide the user to specific pages):
${sitemapText}

CONTEXT (Use this to answer specific questions):
${contextText || "No specific documentation found."}

HISTORY (Previous messages):
${historyText || "First message."}

User Question: ${query}

Helpful Support Response:`;
        // 6. Generate answer via Groq
        let result = "";
        try {
            const completion = await this.groq.chat.completions.create({
                model: this.modelName,
                temperature: 0.2,
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
            });
            result = completion.choices?.[0]?.message?.content?.trim()
                || "I could not generate a complete response right now. Please try again.";
        } catch (err: any) {
            const fallback = sourceDocs[0];
            const fallbackUrl = fallback?.metadata?.source ? `\n\nSource: ${fallback.metadata.source}` : "";
            const fallbackText = fallback?.pageContent
                ? fallback.pageContent.slice(0, 450)
                : "I could not reach the model provider at the moment.";
            result = `I could not reach the language model right now, so here is the best context I found:\n\n${fallbackText}${fallbackUrl}`;
            console.error("[RAGEngine] Groq generation error:", err?.message || err);
        }


        // 8. Human handoff check (SiteChat logic)
        const topScore = Number(sourceDocs[0]?.metadata?.score ?? 0);
        const confidence = Math.max(0, Math.min(1, Number((topScore + Math.min(filteredDocs.length, 3) * 0.08).toFixed(3))));
        let needsHandoff = result.toLowerCase().includes("i don't know") ||
            result.toLowerCase().includes("contact a human") ||
            filteredDocs.length === 0;
        if (confidence < 0.62) needsHandoff = true;

        const supportContact = this.findSupportContact(sitemapPages);
        if (needsHandoff) {
            const contactLine = supportContact
                ? `\n\nFor verified help, please contact customer support here: ${supportContact.url}`
                : "";
            if (!/contact customer support|contact support/i.test(result)) {
                result = `${result}\n\nI may be missing complete context for this question.${contactLine}`;
            }
        }

        const ticketPayload = this.buildAutoTicketPayload(query);
        const raiseTicket = needsHandoff && ticketPayload.shouldRaise;
        if (raiseTicket) {
            result = `${result}\n\nI have created a support ticket for this issue. Our team will follow up shortly.`;
        }
        const resultWithSources = this.appendSources(result, sources);

        // 7. Update History
        chatHistory.push({ role: "user", content: query });
        chatHistory.push({ role: "assistant", content: resultWithSources });
        if (chatHistory.length > this.MAX_CONTEXT_MESSAGES) {
            chatHistory.splice(0, chatHistory.length - this.MAX_CONTEXT_MESSAGES);
        }
        this.historyByCompany.set(historyKey, chatHistory);

        return {
            answer: resultWithSources,
            sources,
            type: "rag-generation",
            needs_handoff: needsHandoff,
            confidence,
            support_contact: supportContact,
            raise_ticket: raiseTicket,
            ticket_payload: raiseTicket ? {
                summary: ticketPayload.summary,
                category: ticketPayload.category,
                priority: ticketPayload.priority,
                urgency: ticketPayload.urgency,
                customer_message: ticketPayload.message,
            } : null,
        };
    }

    private buildSources(docs: LangChainDocument[]) {
        const seen = new Set<string>();
        const uniqueSources: Array<{ url: string; title: string; score?: number; snippet?: string }> = [];

        for (const doc of docs) {
            const url = String(doc.metadata?.source || '').trim();
            const title = String(doc.metadata?.title || 'Untitled source').trim();
            if (!url) continue;
            const key = `${url}::${title}`;
            if (seen.has(key)) continue;
            seen.add(key);
            uniqueSources.push({
                url,
                title,
                score: typeof doc.metadata?.score === 'number' ? Number(doc.metadata.score.toFixed(3)) : undefined,
                snippet: String(doc.pageContent || '').slice(0, 180),
            });
        }

        return uniqueSources;
    }

    private appendSources(
        answer: string,
        sources: Array<{ url: string; title: string }>,
    ): string {
        if (!sources || sources.length === 0) return answer;
        if (/\b(references|sources)\b\s*[:#]/i.test(answer)) return answer;
        const lines = sources.slice(0, 5).map((source) => {
            const title = source.title || source.url;
            const url = source.url || '';
            return /^https?:\/\//i.test(url)
                ? `- [${title}](${url})`
                : `- ${title}`;
        });
        return `${answer}\n\n### References\n${lines.join('\n')}`;
    }

    private rankDocsForQuery(query: string, docs: LangChainDocument[]): LangChainDocument[] {
        const q = query.toLowerCase();
        const intentKeywords = new Set<string>();
        if (/(privacy|data privacy|policy|terms|gdpr)/i.test(q)) {
            ['privacy', 'policy', 'terms', 'legal'].forEach((k) => intentKeywords.add(k));
        }
        if (/(faq|help|support|contact)/i.test(q)) {
            ['faq', 'help', 'support', 'contact'].forEach((k) => intentKeywords.add(k));
        }
        if (/(about|company|who are you)/i.test(q)) {
            ['about', 'company'].forEach((k) => intentKeywords.add(k));
        }

        const scored = docs.map((doc) => {
            const url = String(doc.metadata?.source || '').toLowerCase();
            const title = String(doc.metadata?.title || '').toLowerCase();
            const base = Number(doc.metadata?.score ?? 0);
            const text = `${url} ${title}`;
            const lexicalBoost = Array.from(intentKeywords).reduce((acc, kw) => acc + (text.includes(kw) ? 0.2 : 0), 0);
            return { doc, final: base + lexicalBoost };
        });

        scored.sort((a, b) => b.final - a.final);
        return scored.map((x) => x.doc);
    }

    private findSupportContact(pages: Array<{ url: string; title: string }>) {
        const keywords = ['contact', 'support', 'help', 'faq'];
        const hit = pages.find((p) => {
            const text = `${p.title || ''} ${p.url || ''}`.toLowerCase();
            return keywords.some((k) => text.includes(k));
        });
        return hit ? { url: hit.url, title: hit.title || "Contact Support" } : null;
    }

    private buildAutoTicketPayload(query: string) {
        const message = String(query || "").trim();
        const lower = message.toLowerCase();
        const looksLikeIssue = /error|issue|problem|bug|failed|failure|unable|can't|cannot|doesn'?t work|not working|broken|refund|charge|billing|login|password|reset|access|down|outage/.test(lower);
        const hasDetail =
            message.split(/\s+/).length >= 6 &&
            (/(when|after|while|during|on|if)\b/.test(lower) ||
                /#[0-9]+|[A-Z]{2,}-[0-9]+/.test(message) ||
                /(error|failed|unable|can't|cannot|not working)\b/.test(lower));

        const category =
            /billing|payment|charge|refund|invoice/.test(lower)
                ? "billing"
                : /login|password|signin|sign in|auth/.test(lower)
                    ? "login"
                    : /error|bug|crash|broken|issue|problem|not working|failed|unable/.test(lower)
                        ? "technical"
                        : "other";

        const priority =
            /data loss|security|breach|fraud|chargeback|critical|outage|down|cannot access|can't access|production/.test(lower)
                ? "critical"
                : /urgent|asap|immediately|blocked|cannot|can't|failed|error/.test(lower)
                    ? "high"
                    : /slow|delay|sometimes|intermittent|minor/.test(lower)
                        ? "low"
                        : "medium";

        const urgency = priority;
        const summary = message.length > 140 ? `${message.slice(0, 137).trim()}...` : message || "Customer issue";

        return {
            shouldRaise: looksLikeIssue && hasDetail,
            summary,
            category,
            priority,
            urgency,
            message: message || "Customer reported an issue.",
        };
    }

    public triageIssue(query: string) {
        return this.buildAutoTicketPayload(query);
    }

}

export const ragEngine = new RAGEngine();
