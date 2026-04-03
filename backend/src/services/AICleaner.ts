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
            modelName: "gemini-1.5-flash",
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
                text: rawText.substring(0, 8000), // Limit to avoid token costs/limits
            });

            return result === "NO_CONTENT" ? "" : result;
        } catch (error) {
            console.error("AI Cleaning error:", error);
            return rawText; // Fallback to raw text
        }
    }
}

export const aiCleaner = new AICleaner();
