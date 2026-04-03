import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { LocalEmbeddings } from "./LocalEmbeddings";


import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { Document as LangChainDocument } from "@langchain/core/documents";
import { qdrant, COLLECTION_NAME } from "../config/qdrant";

import { getCollections } from "../config/db";
import { indexerService } from "./Indexer";
import dotenv from "dotenv";





dotenv.config();

export class RAGEngine {
    private model: ChatGoogleGenerativeAI;
    private embeddings: LocalEmbeddings;
    private history: Map<string, any[]> = new Map();

    constructor() {
        this.embeddings = new LocalEmbeddings();
        this.model = new ChatGoogleGenerativeAI({
            apiKey: process.env.GEMINI_API_KEY,
            model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
            temperature: 0.2,
        });
    }




    async answerTicket(query: string, sessionId: string = "default", companyId?: number) {
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
                    return {
                        answer: qaResult.answer,
                        sources: [{ url: "Internal", title: "Pre-defined Q&A" }],
                        type: "qa-match"
                    };
                }
            }
        }


        // 2. Retrieve relevant context
        const contextDocs: LangChainDocument[] = await indexerService.similaritySearch(query, 5);

        // simple relevance grading (threshold check)
        const filteredDocs = contextDocs.filter(doc => (doc.metadata.score ?? 1) > 0.6);
        const contextText = filteredDocs.map((doc: LangChainDocument) => doc.pageContent).join('\n\n');

        // 3. Retrieve Sitemap for navigation guidance
        let sitemapText = "No sitemap available.";
        if (companyId) {
            try {
                const { sitemaps } = await getCollections();
                const sitemapDoc = await sitemaps.findOne({ companyId });
                if (sitemapDoc) {
                    sitemapText = sitemapDoc.pages.map(p => `- ${p.title}: ${p.url}`).join('\n');
                }
            } catch (err) {
                console.error("[RAGEngine] Sitemap fetch error:", err);
            }
        }

        // 4. Conversation History
        const chatHistory = this.history.get(sessionId) || [];
        const historyText = chatHistory.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n');

        // 5. Define prompt template
        const template = `
You are a friendly and proactive Support Chatbot for our website.
Your goal is to help the user find answers and navigate the site effectively.

PERSONA:
- Be empathetic, professional, and concise.
- If you find the answer in the Context, provide it clearly.
- If the answer is not in the context, look at the Sitemap and suggest pages that might be relevant.
- If you are still unsure, suggest they contact a human support agent.
- NEVER make up facts or URLs.

SITEMAP (Use this to guide the user to specific pages):
{sitemap}

CONTEXT (Use this to answer specific questions):
{context}

HISTORY (Previous messages):
{history}

User Question: {question}

Helpful Support Response:`;

        const prompt = PromptTemplate.fromTemplate(template);


        // 5. Create chain
        const chain = RunnableSequence.from([
            prompt,
            this.model,
            new StringOutputParser(),
        ]);

        // 7. Generate answer
        const result = await chain.invoke({
            sitemap: sitemapText,
            context: contextText || "No specific documentation found.",
            history: historyText || "First message.",
            question: query,
        });


        // 8. Human handoff check (SiteChat logic)
        const needsHandoff = result.toLowerCase().includes("i don't know") ||
            result.toLowerCase().includes("contact a human") ||
            filteredDocs.length === 0;

        // 7. Update History
        chatHistory.push({ role: "user", content: query });
        chatHistory.push({ role: "assistant", content: result });
        this.history.set(sessionId, chatHistory);

        return {
            answer: result,
            sources: filteredDocs.map((doc: LangChainDocument) => ({
                url: doc.metadata.source,
                title: doc.metadata.title,
            })),
            type: "rag-generation",
            needs_handoff: needsHandoff
        };
    }


}

export const ragEngine = new RAGEngine();
