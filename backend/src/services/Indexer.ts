import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Document as LangChainDocument } from '@langchain/core/documents';
import { v4 as uuidv4 } from 'uuid';
import { qdrant, COLLECTION_NAME, ensureCollection } from '../config/qdrant';
import { getCollections } from '../config/db';
import dotenv from 'dotenv';


dotenv.config();

export class IndexerService {
    private embeddings: GoogleGenerativeAIEmbeddings;
    private ready: boolean = false;

    constructor() {
        this.embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY,
            modelName: "text-embedding-004",
        });

    }

    /** Lazily ensure the Qdrant collection is ready */
    private async init() {
        if (!this.ready) {
            await ensureCollection();
            this.ready = true;
        }
    }

    async indexPages(pages: { url: string; title: string; content: string }[]): Promise<number> {
        if (pages.length === 0) return 0;
        await this.init();

        // 1. Store Sitemap in MongoDB for navigation awareness
        try {
            const { sitemaps } = await getCollections();
            const companyId = 1; // Default for now
            await sitemaps.updateOne(
                { companyId },
                {
                    $set: {
                        pages: pages.map(p => ({ url: p.url, title: p.title })),
                        updatedAt: new Date()
                    }
                },
                { upsert: true }
            );
            console.log(`[Indexer] Sitemap updated for company ${companyId}`);
        } catch (err) {
            console.error("[Indexer] Failed to store sitemap:", err);
        }

        // 2. Clear existing (Optional: for full overwrite)
        // await this.deleteAll();

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
                    metadata: { source: page.url, title: page.title, chunkIndex: i },
                }));
            });
        }

        console.log(`[Indexer] Embedding ${docs.length} chunks and upserting to Qdrant…`);

        const batchSize = 10;
        for (let i = 0; i < docs.length; i += batchSize) {
            const batch = docs.slice(i, i + batchSize);

            const embeddings = await Promise.all(
                batch.map(d => this.embeddings.embedQuery(d.pageContent))
            );

            const points = batch.map((doc, idx) => ({
                id: uuidv4(),
                vector: embeddings[idx],
                payload: {
                    text: doc.pageContent,
                    source: doc.metadata.source,
                    title: doc.metadata.title,
                    chunkIndex: doc.metadata.chunkIndex,
                },
            }));

            await qdrant.upsert(COLLECTION_NAME, { points, wait: true });

            if (i + batchSize < docs.length) await new Promise(r => setTimeout(r, 500));
        }

        console.log(`[Indexer] Upserted ${docs.length} chunks to Qdrant`);
        return docs.length;
    }

    async similaritySearch(query: string, k: number = 5): Promise<LangChainDocument[]> {
        await this.init();

        const queryVec = await this.embeddings.embedQuery(query);

        const result = await qdrant.search(COLLECTION_NAME, {
            vector: queryVec,
            limit: k,
            with_payload: true,
        });

        if (result.length === 0) {
            throw new Error('No documents found in knowledge base. Run a crawl first.');
        }

        return result.map(hit => new LangChainDocument({
            pageContent: String(hit.payload?.text ?? ''),
            metadata: {
                source: hit.payload?.source,
                title: hit.payload?.title,
                chunkIndex: hit.payload?.chunkIndex,
                score: hit.score,
            },
        }));
    }

    /** Delete all indexed knowledge — drops the Qdrant collection and recreates it empty */
    async deleteAll(): Promise<void> {
        await qdrant.deleteCollection(COLLECTION_NAME);
        console.log(`[Indexer] Deleted collection "${COLLECTION_NAME}"`);
        this.ready = false;         // force re-init on next use
        await this.init();          // recreate immediately
        console.log(`[Indexer] Recreated empty collection "${COLLECTION_NAME}"`);
    }
}

export const indexerService = new IndexerService();

