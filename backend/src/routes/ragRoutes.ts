import { Router, Request, Response } from 'express';
import { CrawlerService } from '../services/Crawler';
import { indexerService } from '../services/Indexer';
import { ragEngine } from '../services/RAGEngine';
import { documentProcessor } from '../services/DocumentProcessor';
import { advancedCrawler } from '../services/AdvancedCrawler';
import { aiCleaner } from '../services/AICleaner';



const router = Router();
const crawler = new CrawlerService();

/**
 * Trigger a website crawl and index the results
 * POST /api/rag/crawl
 */
router.post('/crawl', async (req: Request, res: Response) => {
    const { url, maxPages, useAdvanced, useAI } = req.body;

    if (!url) {
        return res.status(400).json({ error: "URL is required" });
    }

    try {
        // 1. Starting crawl
        console.log(`Starting ${useAdvanced ? 'advanced ' : ''}crawl for ${url}...`);
        let pages;
        if (useAdvanced) {
            pages = await advancedCrawler.crawl(url, maxPages || 10);
        } else {
            pages = await crawler.crawl(url, maxPages || 20);
        }

        if (pages.length === 0) {
            return res.status(404).json({ error: "No pages found to index" });
        }

        // 1.5 Optional AI Cleaning
        if (useAI) {
            console.log(`AI Cleaning ${pages.length} pages...`);
            for (let page of pages) {
                page.content = await aiCleaner.extractKnowledge(page.content, page.url);
            }
            pages = pages.filter(p => p.content.length > 0);
        }

        // 2. Indexing
        console.log(`Indexing ${pages.length} pages...`);
        const chunkCount = await indexerService.indexPages(pages);

        return res.status(200).json({
            message: "Crawl and indexing complete",
            pagesCrawl: pages.length,
            chunksCreated: chunkCount,
        });
    } catch (error) {
        console.error("Crawl/Index error:", error);
        return res.status(500).json({
            error: "Internal server error occurred during crawl/index",
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

/**
 * Upload a file (PDF, DOCX, TXT) and index its content
 * POST /api/rag/upload
 */
router.post('/upload', async (req: Request, res: Response) => {
    // Simple buffer processing without multer for now
    // In a real app, use multer to get the file
    const { filename, content, base64 } = req.body;

    if (!filename || (!content && !base64)) {
        return res.status(400).json({ error: "Filename and content/base64 are required" });
    }

    try {
        const buffer = base64 ? Buffer.from(base64, 'base64') : Buffer.from(content);
        console.log(`Processing uploaded file: ${filename}...`);
        const docs = await documentProcessor.processBuffer(buffer, filename);

        const pages = docs.map(doc => ({
            url: doc.metadata.source || filename,
            title: filename,
            content: doc.pageContent
        }));

        const chunkCount = await indexerService.indexPages(pages);

        return res.status(200).json({
            message: "File indexed successfully",
            chunks: chunkCount
        });
    } catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({
            error: "Internal server error occurred during upload",
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

/**
 * Ask a support question based on indexed knowledge
 * POST /api/rag/query
 */
router.post('/query', async (req: Request, res: Response) => {
    const { question, sessionId, companyId } = req.body;

    if (!question) {
        return res.status(400).json({ error: "Question is required" });
    }

    try {
        const result = await ragEngine.answerTicket(question, sessionId, companyId);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Query error:", error);
        return res.status(500).json({
            error: "Internal server error occurred during query",
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

export default router;
