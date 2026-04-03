import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { Document as LangChainDocument } from '@langchain/core/documents';


import { indexerService } from './Indexer';
import { getCollections } from '../config/db';
import dotenv from 'dotenv';



dotenv.config();

export class RAGEngine {
    private model: ChatGoogleGenerativeAI;
    private history: Map<string, any[]> = new Map();

    constructor() {
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

        // 3. Conversation History
        const chatHistory = this.history.get(sessionId) || [];
        const historyText = chatHistory.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n');

        // 4. Define prompt template
        const template = `
You are a helpful customer support agent for our company. 
Use the provided Context and Conversation History to answer the user's Question.
If the answer is not in the context, say that you don't know and suggest they contact a human agent.
Do not make up facts.

Context:
{context}

History:
{history}

Question: {question}

Helpful Answer:`;

        const prompt = PromptTemplate.fromTemplate(template);

        // 5. Create chain
        const chain = RunnableSequence.from([
            prompt,
            this.model,
            new StringOutputParser(),
        ]);

        // 6. Generate answer
        const result = await chain.invoke({
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
