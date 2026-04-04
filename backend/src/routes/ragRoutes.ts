import { Router, Request, Response, NextFunction } from 'express';
import { crawlerService } from '../services/Crawler';
import { advancedCrawler } from '../services/AdvancedCrawler';
import { indexerService } from '../services/Indexer';
import { getCollections, nextSequence, ApiKeyDoc } from '../config/db';
import { qdrant, COLLECTION_NAME } from '../config/qdrant';
import { ragEngine } from '../services/RAGEngine';
import { emitRealtimeTicketStatusFromHttp } from '../services/chatSocketServer';
import { createRouteMap, routeMapToSitemapPages, summarizeRouteMap } from '../utils/mapNextRoutes';
import { requireAdmin, requireAuth } from '../middleware/authMiddleware';
import { env } from '../config/env';
import { resolveAssignedRole } from '../utils/roleAssignment';
import { inferSentiment } from '../utils/sentiment';
import { ticketVectorService } from '../services/TicketVectorService';
import { signWidgetToken } from '../utils/chatTokens';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const router = Router();

const normalizeBaseUrl = (input?: string): string => {
    try {
        if (!input) return '';
        const url = new URL(input);
        return url.origin;
    } catch {
        return '';
    }
};

const getOrCreateKnowledgeSite = async (
    companyId: number,
    baseUrl: string,
    label?: string,
) => {
    const normalized = normalizeBaseUrl(baseUrl);
    if (!normalized) return null;
    const { knowledgeSites } = await getCollections();
    const existing = await knowledgeSites.findOne({ companyId, baseUrl: normalized });
    if (existing) {
        if (label && label.trim() && existing.label !== label.trim()) {
            const nextLabel = label.trim();
            await knowledgeSites.updateOne(
                { companyId, id: existing.id },
                { $set: { label: nextLabel, updatedAt: new Date() } },
            );
            return { ...existing, label: nextLabel };
        }
        return existing;
    }
    const id = await nextSequence('knowledge_sites');
    const now = new Date();
    const derivedLabel = new URL(normalized).hostname;
    const finalLabel = label?.trim() || derivedLabel;
    const doc = { id, companyId, baseUrl: normalized, label: finalLabel, createdAt: now, updatedAt: now };
    await knowledgeSites.insertOne(doc);
    return doc;
};

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
            (req as any).chatWebsiteId = keyDoc.websiteId ?? null;
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
    const websiteId = (req as any).chatWebsiteId ?? null;
    const apiKeyHeader = req.headers['x-api-key'];
    const apiKey = Array.isArray(apiKeyHeader) ? apiKeyHeader[0] : apiKeyHeader;
    const isWidgetChat = typeof apiKey === 'string' && apiKey.trim() !== '';
    if (!Number.isFinite(companyId) || companyId <= 0) {
        return res.status(401).json({ error: 'Unable to resolve company context.' });
    }

    try {
        const result = await ragEngine.answerTicket(query, sessionId, companyId, websiteId);
        const resultRecord = result as typeof result & { response?: string; message?: string };
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
                const customerName =
                    String(req.body?.customerName || (isWidgetChat ? 'Website Visitor' : 'AI Chat User')).trim()
                    || (isWidgetChat ? 'Website Visitor' : 'AI Chat User');
                const aiAnswer =
                    (typeof result?.answer === 'string' && result.answer.trim())
                    || (typeof resultRecord.response === 'string' && resultRecord.response.trim())
                    || (typeof resultRecord.message === 'string' && resultRecord.message.trim())
                    || '';
                const chatHistory = Array.isArray(req.body?.chatHistory)
                    ? req.body.chatHistory
                        .filter((entry: any) => entry && (entry.role === 'user' || entry.role === 'bot'))
                        .map((entry: any) => ({
                            role: entry.role as 'user' | 'bot',
                            text: String(entry.text ?? '').trim(),
                        }))
                        .filter((entry: { text: string }) => entry.text.length > 0)
                    : [];

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
                    customerName,
                    source: isWidgetChat ? 'widget' : 'ai',
                    createdAt: now,
                    updatedAt: now,
                };

                const inserted = await db.collection('tickets').insertOne(ticketDoc);
                const ticketId = inserted.insertedId;

                let widgetSessionId: string | null = null;
                let widgetChatToken: string | null = null;

                if (isWidgetChat) {
                    widgetSessionId = crypto.randomUUID();
                    await db.collection('chat_sessions').insertOne({
                        sessionId: widgetSessionId,
                        companyId,
                        ticketId,
                        handoffRequested: false,
                        visitorName: customerName,
                        visitorEmail: null,
                        source: 'widget',
                        createdAt: now,
                        updatedAt: now,
                    });

                    if (chatHistory.length > 0) {
                        const seeded = chatHistory.map((entry: { role: 'user' | 'bot'; text: string }, index: number) => {
                            const createdAt = new Date(now.getTime() + index);
                            return {
                                ticketId,
                                companyId,
                                sessionId: widgetSessionId,
                                sender: entry.role,
                                text: entry.text,
                                createdAt,
                                updatedAt: createdAt,
                            };
                        });
                        await db.collection('messages').insertMany(seeded);
                    } else {
                        await db.collection('messages').insertOne({
                            ticketId,
                            companyId,
                            sessionId: widgetSessionId,
                            sender: 'user',
                            text: result.ticket_payload.customer_message || query,
                            createdAt: now,
                            updatedAt: now,
                        });
                    }

                    if (aiAnswer) {
                        const answerCreatedAt = new Date(now.getTime() + chatHistory.length + 1);
                        await db.collection('messages').insertOne({
                            ticketId,
                            companyId,
                            sessionId: widgetSessionId,
                            sender: 'bot',
                            text: aiAnswer,
                            createdAt: answerCreatedAt,
                            updatedAt: answerCreatedAt,
                        });
                    }

                    widgetChatToken = signWidgetToken({
                        companyId,
                        sessionId: widgetSessionId,
                        ticketId: ticketId.toString(),
                    });
                } else {
                    await db.collection('messages').insertOne({
                        ticketId,
                        companyId,
                        sender: 'user',
                        text: result.ticket_payload.customer_message || query,
                        createdAt: now,
                        updatedAt: now,
                    });
                }

                emitRealtimeTicketStatusFromHttp({
                    companyId,
                    ticketId: ticketId.toString(),
                    sessionId: widgetSessionId,
                    status: 'pending',
                    assignedTo: null,
                });

                (result as any).ticket = {
                    _id: ticketId,
                    ...ticketDoc,
                };
                if (widgetSessionId && widgetChatToken) {
                    (result as any).human_handoff = {
                        sessionId: widgetSessionId,
                        ticketId: ticketId.toString(),
                        chatToken: widgetChatToken,
                        handoffRequested: false,
                    };
                }
                try {
                    await ticketVectorService.upsertTicket({
                        ticketId: ticketId.toString(),
                        companyId,
                        message: result.ticket_payload.customer_message || query,
                        category: ticketDoc.category,
                        priority: ticketDoc.priority,
                        customerName: ticketDoc.customerName,
                    });
                    await db.collection('tickets').updateOne(
                        { _id: ticketId },
                        { $set: { vectorizedAt: new Date() } },
                    );
                } catch (error) {
                    console.error("[TicketVector] Failed to index AI ticket:", error);
                }
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
 * Fetch knowledge base stats (sitemap pages + vector count)
 * GET /api/rag/knowledge-base
 */
router.get('/knowledge-base', requireAuth, async (req: Request, res: Response) => {
    try {
        const companyId = req.auth?.companyId;
        if (!companyId) {
            return res.status(401).json({ error: 'Authentication required.' });
        }

        const { sitemaps, knowledgeSites } = await getCollections();
        const sites = await knowledgeSites.find({ companyId }).toArray();
        const sitemapDocs = await sitemaps.find({ companyId }).toArray();

        let vectorCount = 0;
        try {
            const info = await qdrant.getCollection(COLLECTION_NAME);
            vectorCount = Number((info as any)?.points_count ?? 0);
        } catch (err) {
            console.error('[KnowledgeBase] Qdrant info fetch failed:', err);
        }

        const sitePayloads = sites.map((site) => {
            const siteSitemap = sitemapDocs.find((doc) => doc.websiteId === site.id);
            const pages = Array.isArray(siteSitemap?.pages) ? siteSitemap.pages : [];
            return {
                id: site.id,
                label: site.label,
                baseUrl: site.baseUrl,
                totalPages: pages.length,
                pages,
            };
        });

        if (sitePayloads.length === 0) {
            const fallbackSitemap = sitemapDocs.find((doc) => doc.websiteId == null);
            const pages = Array.isArray(fallbackSitemap?.pages) ? fallbackSitemap.pages : [];
            if (pages.length > 0) {
                sitePayloads.push({
                    id: null,
                    label: fallbackSitemap?.baseUrl || 'Default',
                    baseUrl: fallbackSitemap?.baseUrl || '',
                    totalPages: pages.length,
                    pages,
                });
            }
        }

        return res.status(200).json({
            vectorCount,
            sites: sitePayloads,
        });
    } catch (error) {
        console.error('Knowledge base fetch error:', error);
        return res.status(500).json({ error: 'Failed to fetch knowledge base.' });
    }
});

/**
 * Start a website crawl
 * POST /api/rag/crawl
 */
router.post('/crawl', requireAuth, async (req: Request, res: Response) => {
    const {
        url,
        maxPages,
        depthLimit,
        useAdvanced,
        useAI,
        auth,
        excludePatterns,
        privacyPatterns,
        seedUrls,
        websiteId,
        websiteLabel,
    } = req.body;

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

        const { knowledgeSites } = await getCollections();
        let site = null as any;
        if (websiteId) {
            const siteId = Number(websiteId);
            if (Number.isFinite(siteId)) {
                site = await knowledgeSites.findOne({ companyId: req.auth.companyId, id: siteId });
                if (site && site.baseUrl) {
                    const normalized = normalizeBaseUrl(url);
                    if (normalized && site.baseUrl !== normalized) {
                        await knowledgeSites.updateOne(
                            { companyId: req.auth.companyId, id: siteId },
                            { $set: { baseUrl: normalized, updatedAt: new Date() } },
                        );
                        site = { ...site, baseUrl: normalized };
                    }
                }
            }
        }
        if (!site) {
            site = await getOrCreateKnowledgeSite(req.auth.companyId, url, websiteLabel);
        }
        console.log(`Indexing ${pages.length} pages...`);
        const chunksCreated = await indexerService.indexPages(pages, {
            companyId: req.auth.companyId,
            websiteId: site?.id ?? null,
            baseUrl: site?.baseUrl ?? null,
        });

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
 * Create a knowledge site entry (label + base URL)
 */
router.post('/knowledge-sites', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    const companyId = req.auth?.companyId;
    if (!companyId) return res.status(401).json({ error: 'Authentication required.' });
    const label = String(req.body?.label ?? '').trim();
    const baseUrl = String(req.body?.baseUrl ?? '').trim();
    if (!label) return res.status(400).json({ error: 'Website name is required.' });
    if (!baseUrl) return res.status(400).json({ error: 'Website URL is required.' });

    try {
        const normalized = normalizeBaseUrl(baseUrl);
        if (!normalized) return res.status(400).json({ error: 'Invalid website URL.' });
        const { knowledgeSites } = await getCollections();
        const existing = await knowledgeSites.findOne({ companyId, baseUrl: normalized });
        if (existing) {
            if (existing.label !== label) {
                await knowledgeSites.updateOne(
                    { companyId, id: existing.id },
                    { $set: { label, updatedAt: new Date() } },
                );
            }
            return res.status(200).json({ data: { ...existing, label } });
        }
        const id = await nextSequence('knowledge_sites');
        const now = new Date();
        const doc = { id, companyId, baseUrl: normalized, label, createdAt: now, updatedAt: now };
        await knowledgeSites.insertOne(doc);
        return res.status(201).json({ data: doc });
    } catch (err) {
        console.error('Create knowledge site error:', err);
        return res.status(500).json({ error: 'Failed to create website.' });
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
    const { label, websiteId } = req.body;
    const companyId = req.auth?.companyId;
    if (!companyId) return res.status(401).json({ error: 'Authentication required.' });
    try {
        const { apiKeys, knowledgeSites } = await getCollections();
        let siteId: number | null = websiteId ? Number(websiteId) : null;
        if (siteId) {
            const site = await knowledgeSites.findOne({ id: siteId, companyId });
            if (!site) {
                return res.status(400).json({ error: 'Invalid website selection.' });
            }
        }
        const keyId = await nextSequence("api_keys");
        const key = crypto.randomBytes(32).toString('hex');

        const newApiKey: ApiKeyDoc = {
            id: keyId,
            companyId,
            key,
            label: label || 'New API Key',
            websiteId: siteId ?? null,
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
