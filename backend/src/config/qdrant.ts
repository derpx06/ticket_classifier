import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';
dotenv.config();

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || undefined;

export const COLLECTION_NAME = process.env.QDRANT_COLLECTION || 'ticket_knowledge';
export const VECTOR_SIZE = 384; // BAAI/bge-small-en-v1.5 dimension
const AUTO_RECREATE_ON_DIM_MISMATCH = (process.env.QDRANT_AUTO_RECREATE_ON_DIM_MISMATCH || 'true') === 'true';


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

    if (exists) {
        const info = await qdrant.getCollection(COLLECTION_NAME);
        const vectors: any = info?.config?.params?.vectors as any;
        const currentSize =
            typeof vectors?.size === 'number'
                ? vectors.size
                : typeof vectors?.default?.size === 'number'
                    ? vectors.default.size
                    : null;

        if (currentSize !== null && currentSize !== VECTOR_SIZE) {
            const msg = `[Qdrant] Dimension mismatch: expected ${VECTOR_SIZE}, found ${currentSize}`;
            if (!AUTO_RECREATE_ON_DIM_MISMATCH) {
                throw new Error(`${msg}. Recreate collection manually or set QDRANT_AUTO_RECREATE_ON_DIM_MISMATCH=true`);
            }
            console.warn(`${msg}. Recreating collection...`);
            await qdrant.deleteCollection(COLLECTION_NAME);
            await createNewCollection();
        } else {
            console.log(`[Qdrant] Collection "${COLLECTION_NAME}" already exists with correct dimensions.`);
        }
    } else {
        await createNewCollection();
    }
}

async function createNewCollection() {
    await qdrant.createCollection(COLLECTION_NAME, {
        vectors: {
            size: VECTOR_SIZE,
            distance: 'Cosine',
        },
    });
    console.log(`[Qdrant] Created collection "${COLLECTION_NAME}" with size ${VECTOR_SIZE}`);
}
