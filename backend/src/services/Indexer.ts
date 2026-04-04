import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { LocalEmbeddings } from './LocalEmbeddings';

import { Document as LangChainDocument } from '@langchain/core/documents';
import { v4 as uuidv4 } from 'uuid';
import { qdrant, ensureCollection, getKnowledgeCollectionName } from '../config/qdrant';
import { getCollections } from '../config/db';
import dotenv from 'dotenv';

dotenv.config();

export class IndexerService {
    private embeddings: LocalEmbeddings;
    private readyCollections: Set<string> = new Set();

    constructor() {
        this.embeddings = new LocalEmbeddings();
    }


    /** Lazily ensure the Qdrant collection is ready */
    private async init(collectionName: string) {
        if (!this.readyCollections.has(collectionName)) {
            await ensureCollection(collectionName);
            this.readyCollections.add(collectionName);
        }
    }

    async indexPages(
        pages: { url: string; title: string; content: string }[],
        options?: { companyId?: number; websiteId?: number | null; baseUrl?: string | null },
    ): Promise<number> {
        if (pages.length === 0) return 0;
        const collectionName = getKnowledgeCollectionName(options?.companyId, options?.websiteId ?? null);
        await this.init(collectionName);

        // 1. Store Sitemap in MongoDB for navigation awareness
        try {
            const { sitemaps } = await getCollections();
            const companyId = options?.companyId ?? 1;
            const websiteId = options?.websiteId ?? null;
            const baseUrl = options?.baseUrl ?? null;
            const existing = await sitemaps.findOne({ companyId, websiteId });
            const existingPages = Array.isArray(existing?.pages) ? existing!.pages : [];
            const pageMap = new Map<string, { url: string; title: string }>();
            existingPages.forEach((p) => {
                if (p?.url) pageMap.set(p.url, { url: p.url, title: p.title || p.url });
            });
            pages.forEach((p) => {
                if (p?.url) pageMap.set(p.url, { url: p.url, title: p.title || p.url });
            });
            const mergedPages = Array.from(pageMap.values());

            await sitemaps.updateOne(
                { companyId, websiteId },
                {
                    $set: {
                        pages: mergedPages,
                        baseUrl,
                        updatedAt: new Date()
                    }
                },
                { upsert: true }
            );
            console.log(`[Indexer] Sitemap updated for company ${companyId} (${mergedPages.length} pages)`);
        } catch (err) {
            console.error("[Indexer] Failed to store sitemap:", err);
        }

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

            try {
                const embeddings = await this.embeddings.embedDocuments(
                    batch.map(d => d.pageContent)
                );

                const points = batch.map((doc, idx) => ({
                    id: uuidv4(),
                    vector: embeddings[idx],
                    payload: {
                        content: doc.pageContent,
                        source: doc.metadata.source,
                        title: doc.metadata.title,
                        chunkIndex: doc.metadata.chunkIndex,
                        companyId: options?.companyId ?? 1,
                        websiteId: options?.websiteId ?? null,
                    },
                }));

                await qdrant.upsert(collectionName, { points, wait: true });
            } catch (err: any) {
                console.error(`[Indexer] Batch embedding error (offset ${i}):`, err.message);
                if (err.response?.data) console.error("[Indexer] Error details:", err.response.data);
                throw err;
            }

            if (i + batchSize < docs.length) await new Promise(r => setTimeout(r, 500));
        }

        console.log(`[Indexer] Upserted ${docs.length} chunks to Qdrant (${collectionName})`);
        return docs.length;
    }

    async similaritySearch(
        query: string,
        k: number = 5,
        filter?: { companyId?: number; websiteId?: number | null },
    ): Promise<LangChainDocument[]> {
        const collectionName = getKnowledgeCollectionName(filter?.companyId, filter?.websiteId ?? null);
        await this.init(collectionName);
        const queryVector = await this.embeddings.embedQuery(query);
        const results = await qdrant.search(collectionName, {
            vector: queryVector,
            limit: k,
            with_payload: true,
            // Collection is already scoped per company + website, so no extra filter needed.
        });

        return results.map(r => new LangChainDocument({
            pageContent: r.payload?.content as string,
            metadata: { ...r.payload, score: r.score }
        }));
    }

    /** Delete all indexed knowledge — drops the Qdrant collection and recreates it empty */
    async deleteAll(options?: { companyId?: number; websiteId?: number | null }): Promise<void> {
        const collectionName = getKnowledgeCollectionName(options?.companyId, options?.websiteId ?? null);
        await qdrant.deleteCollection(collectionName);
        console.log(`[Indexer] Deleted collection "${collectionName}"`);
        this.readyCollections.delete(collectionName);         // force re-init on next use
        await this.init(collectionName);          // recreate immediately
        console.log(`[Indexer] Recreated empty collection "${collectionName}"`);
    }
}

export const indexerService = new IndexerService();
