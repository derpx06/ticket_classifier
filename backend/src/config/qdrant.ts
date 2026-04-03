import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';
dotenv.config();

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || undefined;

export const COLLECTION_NAME = process.env.QDRANT_COLLECTION || 'ticket_knowledge';
export const TICKETS_COLLECTION_NAME =
    process.env.QDRANT_TICKETS_COLLECTION || 'ticket_queries';
export const VECTOR_SIZE = 384; // BAAI/bge-small-en-v1.5 dimension
const AUTO_RECREATE_ON_DIM_MISMATCH =
    (process.env.QDRANT_AUTO_RECREATE_ON_DIM_MISMATCH || 'true').toLowerCase() !== 'false';


export const qdrant = new QdrantClient({
    url: QDRANT_URL,
    ...(QDRANT_API_KEY ? { apiKey: QDRANT_API_KEY } : {}),
});

function extractVectorSize(vectorsConfig: any): number | null {
    if (!vectorsConfig) return null;
    // Single-vector collection shape: { size, distance }
    if (typeof vectorsConfig.size === 'number') return vectorsConfig.size;
    // Named vectors shape: { default: { size, distance }, ... }
    if (typeof vectorsConfig === 'object') {
        for (const val of Object.values(vectorsConfig)) {
            if (val && typeof (val as any).size === 'number') {
                return (val as any).size;
            }
        }
    }
    return null;
}

async function createCollectionWithExpectedDim(name: string) {
    await qdrant.createCollection(name, {
        vectors: {
            size: VECTOR_SIZE,
            distance: 'Cosine',
        },
    });
    console.log(`[Qdrant] Created collection "${name}" (dim=${VECTOR_SIZE})`);
}

/**
 * Ensure the collection exists in Qdrant, creating it if not.
 */
export async function ensureCollection(): Promise<void> {
    const { collections } = await qdrant.getCollections();
    const exists = collections.some(c => c.name === COLLECTION_NAME);

    if (!exists) {
        await createCollectionWithExpectedDim(COLLECTION_NAME);
        return;
    }

    const info = await qdrant.getCollection(COLLECTION_NAME);
    const existingSize = extractVectorSize((info as any)?.config?.params?.vectors);

    if (existingSize === VECTOR_SIZE) {
        try {
            await qdrant.createPayloadIndex(COLLECTION_NAME, {
                field_name: 'companyId',
                field_schema: 'integer',
            });
            await qdrant.createPayloadIndex(COLLECTION_NAME, {
                field_name: 'websiteId',
                field_schema: 'integer',
            });
        } catch {
            // ignore index errors (already exists or cloud restrictions)
        }
        console.log(`[Qdrant] Collection "${COLLECTION_NAME}" already exists (dim=${existingSize})`);
        return;
    }

    const msg = `[Qdrant] Dimension mismatch for "${COLLECTION_NAME}": existing=${existingSize}, expected=${VECTOR_SIZE}`;
    if (!AUTO_RECREATE_ON_DIM_MISMATCH) {
        throw new Error(`${msg}. Set QDRANT_AUTO_RECREATE_ON_DIM_MISMATCH=true to auto-fix.`);
    }

    console.warn(`${msg}. Recreating collection...`);
    await qdrant.deleteCollection(COLLECTION_NAME);
    await createCollectionWithExpectedDim(COLLECTION_NAME);
    try {
        await qdrant.createPayloadIndex(COLLECTION_NAME, {
            field_name: 'companyId',
            field_schema: 'integer',
        });
        await qdrant.createPayloadIndex(COLLECTION_NAME, {
            field_name: 'websiteId',
            field_schema: 'integer',
        });
    } catch {
        // ignore index errors
    }
}

export async function ensureTicketsCollection(): Promise<void> {
    const { collections } = await qdrant.getCollections();
    const exists = collections.some(c => c.name === TICKETS_COLLECTION_NAME);

    if (!exists) {
        await createCollectionWithExpectedDim(TICKETS_COLLECTION_NAME);
        return;
    }

    const info = await qdrant.getCollection(TICKETS_COLLECTION_NAME);
    const existingSize = extractVectorSize((info as any)?.config?.params?.vectors);

    if (existingSize === VECTOR_SIZE) {
        console.log(`[Qdrant] Collection "${TICKETS_COLLECTION_NAME}" already exists (dim=${existingSize})`);
        return;
    }

    const msg = `[Qdrant] Dimension mismatch for "${TICKETS_COLLECTION_NAME}": existing=${existingSize}, expected=${VECTOR_SIZE}`;
    if (!AUTO_RECREATE_ON_DIM_MISMATCH) {
        throw new Error(`${msg}. Set QDRANT_AUTO_RECREATE_ON_DIM_MISMATCH=true to auto-fix.`);
    }

    console.warn(`${msg}. Recreating collection...`);
    await qdrant.deleteCollection(TICKETS_COLLECTION_NAME);
    await createCollectionWithExpectedDim(TICKETS_COLLECTION_NAME);
}
