import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Document as LangChainDocument } from '@langchain/core/documents';
import dotenv from 'dotenv';

dotenv.config();

export interface VectorDocument {
    doc: LangChainDocument;
    embedding: number[];
}

export class IndexerService {
    private documents: VectorDocument[] = [];
    private embeddings: GoogleGenerativeAIEmbeddings;

    constructor() {
        this.embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY,
            model: "embedding-001",
        });

    }

    async indexPages(pages: { url: string; title: string; content: string }[]) {
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        const docs: LangChainDocument[] = [];

        for (const page of pages) {
            const chunks = await splitter.splitText(page.content);
            chunks.forEach((chunk: string, i: number) => {
                docs.push(new LangChainDocument({
                    pageContent: chunk,
                    metadata: {
                        source: page.url,
                        title: page.title,
                        chunkIndex: i,
                    },
                }));
            });
        }

        // Embed all documents (Batching to avoid rate limits)
        console.log(`Embedding ${docs.length} chunks...`);
        const embeddedDocs: VectorDocument[] = [];
        const batchSize = 10;

        for (let i = 0; i < docs.length; i += batchSize) {
            const batch = docs.slice(i, i + batchSize);
            const batchEmbeds = await Promise.all(
                batch.map(async (doc) => ({
                    doc,
                    embedding: await this.embeddings.embedQuery(doc.pageContent),
                }))
            );
            embeddedDocs.push(...batchEmbeds);
            // Slight delay between batches if needed
            if (i + batchSize < docs.length) await new Promise(r => setTimeout(r, 500));
        }


        this.documents = embeddedDocs;
        return docs.length;
    }

    async similaritySearch(query: string, k: number = 3): Promise<LangChainDocument[]> {
        if (this.documents.length === 0) {
            throw new Error("Vector store is empty. Run indexing first.");
        }

        const queryEmbedding = await this.embeddings.embedQuery(query);

        // Calculate cosine similarity
        const scoredDocs = this.documents.map((target) => {
            const score = this.cosineSimilarity(queryEmbedding, target.embedding);
            return { doc: target.doc, score };
        });

        // Sort by score and return top K
        return scoredDocs
            .sort((a, b) => b.score - a.score)
            .slice(0, k)
            .map((item) => item.doc);
    }

    private cosineSimilarity(vecA: number[], vecB: number[]): number {
        const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
        const m1 = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
        const m2 = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
        return dotProduct / (m1 * m2);
    }
}

export const indexerService = new IndexerService();
