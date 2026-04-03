import { Router, Request, Response } from 'express';
import { crawlerService, CrawlerService } from '../services/Crawler';
import { advancedCrawler } from '../services/AdvancedCrawler';
import { indexerService } from '../services/Indexer';
import { aiCleaner } from '../services/AICleaner';
import { getCollections, nextSequence, ApiKeyDoc } from '../config/db';
import { ragEngine } from '../services/RAGEngine';
import crypto from 'crypto';

const router = Router();

/**
 * Middleware to validate API Key for external requests
 */
const authenticateApiKey = async (req: Request, res: Response, next: any) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) return next();

    try {
        const { apiKeys } = await getCollections();
        const keyDoc = await apiKeys.findOne({ key: apiKey as string, isActive: true });
        if (!keyDoc) {
            return res.status(401).json({ error: 'Invalid or inactive API Key' });
        }
        (req as any).user = { companyId: keyDoc.companyId };
        next();
    } catch (err) {
        res.status(500).json({ error: 'Auth error' });
    }
};

/**
 * Send a query to the Support Chatbot
 * POST /api/rag/chat
 */
router.post('/chat', authenticateApiKey, async (req: Request, res: Response) => {
    const { query, sessionId } = req.body;
    const companyId = (req as any).user?.companyId || 1;

    try {
        const result = await ragEngine.answerTicket(query, sessionId, companyId);
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
router.post('/crawl', async (req: Request, res: Response) => {
    const { url, maxPages, depthLimit, useAdvanced, useAI, auth, excludePatterns, privacyPatterns } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        console.log(`Starting crawl for ${url}...`);
        let pages;

        // Wrapper for parallel indexing
        const onPageCrawled = async (page: any) => {
            console.log(`[Route] Stream-indexing page: ${page.url}`);
            await indexerService.indexPages([page]);
        };

        if (useAdvanced) {
            pages = await advancedCrawler.crawl(url, maxPages || 10, 2, auth || {}, {
                excludePatterns: excludePatterns || [],
                privacyPatterns: privacyPatterns || [],
                useAI: useAI || false,
                onPageCrawled
            });
        } else {
            pages = await crawlerService.crawl(url, maxPages || 20, 2, auth || {}, {
                excludePatterns: excludePatterns || [],
                privacyPatterns: privacyPatterns || [],
                useAI: useAI || false,
                onPageCrawled
            });
        }

        return res.status(200).json({
            message: 'Crawl and indexing complete',
            pagesCrawl: pages.length
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
 * Delete all indexed knowledge from the vector database
 */
router.delete('/knowledge-base', async (req: Request, res: Response) => {
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

router.get('/api-keys', async (req: Request, res: Response) => {
    const companyId = (req as any).user?.companyId || 1;
    try {
        const { apiKeys } = await getCollections();
        const keys = await apiKeys.find({ companyId }).toArray();
        return res.status(200).json(keys);
    } catch (err) {
        return res.status(500).json({ error: 'Failed to fetch API keys' });
    }
});

router.post('/api-keys', async (req: Request, res: Response) => {
    const { label } = req.body;
    const companyId = (req as any).user?.companyId || 1;
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

router.delete('/api-keys/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    const companyId = (req as any).user?.companyId || 1;
    try {
        const { apiKeys } = await getCollections();
        await apiKeys.deleteOne({ id, companyId });
        return res.status(200).json({ message: 'API key revoked' });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to revoke API key' });
    }
});

export default router;
