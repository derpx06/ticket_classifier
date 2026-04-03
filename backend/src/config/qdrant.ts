import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';
dotenv.config();

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || undefined;

export const COLLECTION_NAME = process.env.QDRANT_COLLECTION || 'ticket_knowledge';
export const VECTOR_SIZE = 384; // BAAI/bge-small-en-v1.5 dimension


export const qdrant = new QdrantClient({
    url: QDRANT_URL,
    ...(QDRANT_API_KEY ? { apiKey: QDRANT_API_KEY } : {}),
});

/**
 * Ensure the collection exists in Qdrant, creating it if not.
 */
export async function ensureCollection(): Promise<void> {
    const { collections } = await qdrant.getCollections();
    const exists = collections.some(c => c.name === COLLECTION_NAME);

    if (!exists) {
        await qdrant.createCollection(COLLECTION_NAME, {
            vectors: {
                size: VECTOR_SIZE,
                distance: 'Cosine',
            },
        });
        console.log(`[Qdrant] Created collection "${COLLECTION_NAME}"`);
    } else {
        console.log(`[Qdrant] Collection "${COLLECTION_NAME}" already exists`);
    }
}
