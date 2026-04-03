import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import dotenv from 'dotenv';

dotenv.config();

export class AICleaner {
    private model: ChatGoogleGenerativeAI;

    constructor() {
        this.model = new ChatGoogleGenerativeAI({
            apiKey: process.env.GEMINI_API_KEY,
            model: process.env.GEMINI_MODEL || "gemini-3-flash-preview",

            temperature: 0, // Deterministic cleaning
        });

    }

    async extractKnowledge(rawText: string, url: string): Promise<string> {
        if (rawText.length < 200) return rawText; // Skip very small snippets

        const template = `
You are an expert at extracting core knowledge from messy web data.
Below is the raw text from a webpage: {url}.

YOUR TASK:
1. Identify the core information, instructions, and facts.
2. Remove all UI boilerplate (e.g., "Click here", "Sign up", menus, copyright).
3. Keep the text professional and well-structured.
4. If the page is empty or irrelevant, return "NO_CONTENT".

Raw Text:
{text}

Cleaned Knowledge:`;

        const prompt = PromptTemplate.fromTemplate(template);
        const chain = RunnableSequence.from([
            prompt,
            this.model,
            new StringOutputParser(),
        ]);

        try {
            const result = await chain.invoke({
                url: url,
                text: rawText.substring(0, 10000), // Increased slightly
            });

            return result === "NO_CONTENT" ? "" : result;
        } catch (error) {
            console.error("AI Cleaning error:", error);
            return rawText; // Fallback to raw text
        }
    }

    /**
     * Extracts a glimpse of the page while explicitly ignoring private/PII data.
     */
    async extractKnowledgeWithPrivacy(rawText: string, url: string): Promise<string> {
        const template = `
You are a privacy-first AI knowledge extractor.
Below is raw text from a page: {url}.

YOUR TASK:
1. Summarize the PURPOSE and GENERAL CONTENT of this page for a company knowledge base.
2. CRITICAL: Strip out all Personally Identifiable Information (PII), specific user names, emails, account IDs, balances, or private settings.
3. If this is a private dashboard or profile, describe the TYPE of page (e.g. "User account settings page") but DO NOT capture the actual values.
4. If it contains general documentation or features, summarize them clearly.
5. Goal: Help the RAG model know *what* is on this page without knowing *who* it belongs to or their secrets.

Raw Text:
{text}

Privacy-Preserving Summary:`;

        const prompt = PromptTemplate.fromTemplate(template);
        const chain = RunnableSequence.from([
            prompt,
            this.model,
            new StringOutputParser(),
        ]);

        try {
            const result = await chain.invoke({
                url: url,
                text: rawText.substring(0, 8000),
            });
            return result === "NO_CONTENT" ? "" : result;
        } catch (error) {
            console.error("AI Privacy Cleaning error:", error);
            return "Failed to summarize page safely.";
        }
    }
}


export const aiCleaner = new AICleaner();
