import { Router, Request, Response, NextFunction } from 'express';
import { crawlerService } from '../services/Crawler';
import { advancedCrawler } from '../services/AdvancedCrawler';
import { indexerService } from '../services/Indexer';
import { getCollections, nextSequence, ApiKeyDoc } from '../config/db';
import { ragEngine } from '../services/RAGEngine';
import { emitTicketUpdateFromHttp } from '../services/chatSocketServer';
import { createRouteMap, routeMapToSitemapPages, summarizeRouteMap } from '../utils/mapNextRoutes';
import { requireAdmin, requireAuth } from '../middleware/authMiddleware';
import { env } from '../config/env';
import { resolveAssignedRole } from '../utils/roleAssignment';
import { inferSentiment } from '../utils/sentiment';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const router = Router();

/**
 * Resolve chat company from API key (external widget) or JWT (dashboard)
 */
const resolveChatCompany = async (req: Request, res: Response, next: NextFunction) => {
    const apiKeyHeader = req.headers['x-api-key'];
    const apiKey = Array.isArray(apiKeyHeader) ? apiKeyHeader[0] : apiKeyHeader;
    if (typeof apiKey === 'string' && apiKey.trim() !== '') {
        try {
            const { apiKeys } = await getCollections();
            const keyDoc = await apiKeys.findOne({ key: apiKey.trim(), isActive: true });
            if (!keyDoc) {
                return res.status(401).json({ error: 'Invalid or inactive API Key' });
            }
            (req as any).chatCompanyId = keyDoc.companyId;
            return next();
        } catch {
            return res.status(500).json({ error: 'Auth error' });
        }
    }

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        try {
            const decoded = jwt.verify(token, env.jwtSecret) as { companyId?: number };
            if (typeof decoded.companyId === 'number') {
                (req as any).chatCompanyId = decoded.companyId;
                return next();
            }
        } catch {
            return res.status(401).json({ error: 'Invalid or expired session.' });
        }
    }

    return res.status(401).json({ error: 'Authentication required.' });
};

/**
 * Send a query to the Support Chatbot
 * POST /api/rag/chat
 */
router.post('/chat', resolveChatCompany, async (req: Request, res: Response) => {
    const { query, sessionId } = req.body;
    const companyId = Number((req as any).chatCompanyId);
    if (!Number.isFinite(companyId) || companyId <= 0) {
        return res.status(401).json({ error: 'Unable to resolve company context.' });
    }

    try {
        const result = await ragEngine.answerTicket(query, sessionId, companyId);
        if (result?.raise_ticket && result?.ticket_payload) {
            try {
                const { users } = await getCollections();
                const db = users.db;
                const now = new Date();
                const assignedRole = await resolveAssignedRole(
                    companyId,
                    result.ticket_payload.category || 'other',
                    result.ticket_payload.customer_message || query,
                );
                const sentiment = inferSentiment(result.ticket_payload.customer_message || query);

                const ticketDoc = {
                    companyId,
                    message: result.ticket_payload.summary || query,
                    category: result.ticket_payload.category || 'other',
                    priority: result.ticket_payload.priority || 'medium',
                    urgency: result.ticket_payload.urgency || result.ticket_payload.priority || 'medium',
                    status: 'pending',
                    assignedTo: null as number | null,
                    assignedRoleId: assignedRole?.id ?? null,
                    assignedRoleName: assignedRole?.name ?? null,
                    sentiment: sentiment.label,
                    sentimentEmoji: sentiment.emoji,
                    customerName: String(req.body?.customerName || 'AI Chat User').trim() || 'AI Chat User',
                    source: 'ai',
                    createdAt: now,
                    updatedAt: now,
                };

                const inserted = await db.collection('tickets').insertOne(ticketDoc);
                const ticketId = inserted.insertedId;

                await db.collection('messages').insertOne({
                    ticketId,
                    companyId,
                    sender: 'user',
                    text: result.ticket_payload.customer_message || query,
                    createdAt: now,
                    updatedAt: now,
                });

                emitTicketUpdateFromHttp({
                    companyId,
                    ticketId: ticketId.toString(),
                    status: 'pending',
                    assignedTo: null,
                    updatedAt: now,
                });

                (result as any).ticket = {
                    _id: ticketId,
                    ...ticketDoc,
                };
            } catch (err) {
                console.error('[RAG] Auto ticket creation failed:', err);
            }
        }
        return res.status(200).json(result);
    } catch (error) {
        console.error('Chat error:', error);
        return res.status(500).json({ error: 'Failed to process chat' });
    }
});

/**
 * Start a website crawl
 * POST /api/rag/crawl
 */
router.post('/crawl', requireAuth, async (req: Request, res: Response) => {
    const { url, maxPages, depthLimit, useAdvanced, useAI, auth, excludePatterns, privacyPatterns, seedUrls } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        console.log(`Starting crawl for ${url}...`);
        let pages;

        if (useAdvanced) {
            pages = await advancedCrawler.crawl(url, maxPages || 10, depthLimit ?? 2, auth || {}, {
                excludePatterns: excludePatterns || [],
                privacyPatterns: privacyPatterns || [],
                useAI: useAI || false,
                seedUrls: seedUrls || []
            });
        } else {
            pages = await crawlerService.crawl(url, maxPages || 20, depthLimit ?? 2, auth || {}, {
                excludePatterns: excludePatterns || [],
                privacyPatterns: privacyPatterns || [],
                useAI: useAI || false,
                seedUrls: seedUrls || []
            });
        }

        console.log(`Indexing ${pages.length} pages...`);
        const chunksCreated = await indexerService.indexPages(pages);

        return res.status(200).json({
            message: 'Crawl and indexing complete',
            pagesCrawl: pages.length,
            chunksCreated
        });
    } catch (error) {
        console.error('Crawl/Index error:', error);
        return res.status(500).json({
            error: 'Failed to complete crawl/index',
            details: error instanceof Error ? error.message : String(error),
        });
    }
});

/**
 * Build a sitemap from a Next.js codebase and optionally store it for chat navigation.
 * POST /api/rag/sitemap/codebase
 */
router.post('/sitemap/codebase', requireAuth, async (req: Request, res: Response) => {
    const { projectPath, baseUrl, saveToCompany = true } = req.body || {};
    const companyId = req.auth?.companyId;
    if (!companyId) return res.status(401).json({ error: 'Authentication required.' });

    if (!projectPath) {
        return res.status(400).json({ error: 'projectPath is required' });
    }

    try {
        const routeMap = createRouteMap(projectPath);
        const sitemapPages = routeMapToSitemapPages(routeMap, baseUrl);
        const description = summarizeRouteMap(routeMap);

        if (saveToCompany) {
            const { sitemaps } = await getCollections();
            await sitemaps.updateOne(
                { companyId },
                {
                    $set: {
                        pages: sitemapPages.map((p) => ({ url: p.url, title: p.title })),
                        routeMap,
                        description,
                        source: 'codebase',
                        updatedAt: new Date(),
                    },
                },
                { upsert: true },
            );
        }

        return res.status(200).json({
            message: 'Codebase sitemap generated',
            description,
            counts: routeMap.counts,
            totalPages: sitemapPages.length,
            sitemapPages,
            routeMap,
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Failed to generate codebase sitemap',
            details: error instanceof Error ? error.message : String(error),
        });
    }
});

/**
 * Delete all indexed knowledge from the vector database
 */
router.delete('/knowledge-base', requireAuth, async (req: Request, res: Response) => {
    try {
        await indexerService.deleteAll();
        return res.status(200).json({ message: 'Knowledge base fully cleared.' });
    } catch (error) {
        console.error('Delete knowledge error:', error);
        return res.status(500).json({ error: 'Failed to clear knowledge base.' });
    }
});

/**
 * --- API Key Management ---
 */

router.get('/api-keys', requireAuth, async (req: Request, res: Response) => {
    const companyId = req.auth?.companyId;
    if (!companyId) return res.status(401).json({ error: 'Authentication required.' });
    try {
        const { apiKeys } = await getCollections();
        const keys = await apiKeys.find({ companyId }).toArray();
        return res.status(200).json(keys);
    } catch (err) {
        return res.status(500).json({ error: 'Failed to fetch API keys' });
    }
});

router.post('/api-keys', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    const { label } = req.body;
    const companyId = req.auth?.companyId;
    if (!companyId) return res.status(401).json({ error: 'Authentication required.' });
    try {
        const { apiKeys } = await getCollections();
        const keyId = await nextSequence("api_keys");
        const key = crypto.randomBytes(32).toString('hex');

        const newApiKey: ApiKeyDoc = {
            id: keyId,
            companyId,
            key,
            label: label || 'New API Key',
            isActive: true,
            createdAt: new Date()
        };

        await apiKeys.insertOne(newApiKey);
        return res.status(201).json(newApiKey);
    } catch (err) {
        return res.status(500).json({ error: 'Failed to create API key' });
    }
});

router.delete('/api-keys/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    const companyId = req.auth?.companyId;
    if (!companyId) return res.status(401).json({ error: 'Authentication required.' });
    try {
        const { apiKeys } = await getCollections();
        await apiKeys.deleteOne({ id, companyId });
        return res.status(200).json({ message: 'API key revoked' });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to revoke API key' });
    }
});

export default router;
