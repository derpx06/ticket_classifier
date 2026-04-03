import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';
import { aiCleaner } from './AICleaner';

export interface CrawlPage {
  url: string;
  title: string;
  content: string;
  metadata?: any;
}

export interface CrawlAuthOptions {
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
}

export class CrawlerService {
  private visited = new Set<string>();
  private pages: CrawlPage[] = [];

  async crawl(
    startUrl: string,
    maxPages: number = 20,
    auth: CrawlAuthOptions = {},
    options: { excludePatterns?: string[], privacyPatterns?: string[], useAI?: boolean } = {}
  ): Promise<CrawlPage[]> {
    const { excludePatterns = [], privacyPatterns = [], useAI = false } = options;
    this.visited.clear();
    this.pages = [];
    const baseUrl = new URL(startUrl).origin;

    const excludeRegexes = excludePatterns.map(p => new RegExp(p, 'i'));
    const privacyRegexes = privacyPatterns.map(p => new RegExp(p, 'i'));

    // Build cookie header string
    const cookieHeader = auth.cookies
      ? Object.entries(auth.cookies).map(([k, v]) => `${k}=${v}`).join('; ')
      : undefined;

    const requestHeaders: Record<string, string> = {
      'User-Agent': 'TicketClassifier-Crawler/1.0',
      ...auth.headers,
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    };

    const queue: string[] = [startUrl];

    while (queue.length > 0 && this.pages.length < maxPages) {
      const url = queue.shift()!;
      if (this.visited.has(url)) continue;

      // Exclusion check
      if (excludeRegexes.some(re => re.test(url))) {
        console.log(`[Crawler] Skipping excluded URL: ${url}`);
        continue;
      }

      this.visited.add(url);

      try {
        console.log(`[Crawler] Crawling: ${url}`);
        const response = await axios.get(url, {
          headers: requestHeaders,
          timeout: 10000,
          maxRedirects: 5,
        });

        const finalUrl = response.request?.res?.responseUrl || url;
        if (!finalUrl.startsWith(baseUrl)) {
          console.warn(`Skipped (redirected outside domain): ${url} → ${finalUrl}`);
          continue;
        }

        const $ = cheerio.load(response.data);
        const title = $('title').text().trim() || url;

        $('script, style, nav, footer, header').remove();
        const rawContent = $('body').text().replace(/\s+/g, ' ').trim();

        let finalContent = rawContent;
        const isPrivate = privacyRegexes.some(re => re.test(url));

        if (useAI) {
          if (isPrivate) {
            console.log(`[Crawler] Privacy mode enabled for ${url}. Summarizing...`);
            finalContent = await aiCleaner.extractKnowledgeWithPrivacy(rawContent, url);
          } else {
            finalContent = await aiCleaner.extractKnowledge(rawContent, url);
          }
        }

        this.pages.push({
          url,
          title,
          content: finalContent,
          metadata: { isPrivateSnippet: isPrivate }
        });

        $('a[href]').each((_, el) => {
          const href = $(el).attr('href');
          if (href) {
            try {
              const absoluteUrl = new URL(href, url).href.split('#')[0];
              if (absoluteUrl.startsWith(baseUrl) && !this.visited.has(absoluteUrl)) {
                queue.push(absoluteUrl);
              }
            } catch (e) { /* ignore */ }
          }
        });
      } catch (error) {
        console.error(`Failed to crawl ${url}:`, error instanceof Error ? error.message : String(error));
      }
    }

    return this.pages;
  }
}

export const crawlerService = new CrawlerService();
