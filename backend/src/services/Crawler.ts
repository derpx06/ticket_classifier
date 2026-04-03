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
  private isLikelyDetailPage(url: string): boolean {
    try {
      const pathname = new URL(url).pathname.toLowerCase();
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length < 2) return false;
      const first = parts[0];
      const detailRoots = new Set(['single', 'article', 'articles', 'blog', 'post', 'posts', 'news', 'docs']);
      if (!detailRoots.has(first)) return false;
      const slug = parts[1] || '';
      return slug.length > 8 || slug.includes('-') || /\d/.test(slug);
    } catch {
      return false;
    }
  }

  private isCrawlablePath(url: string): boolean {
    try {
      const p = new URL(url).pathname.toLowerCase();
      if (p.startsWith('/api/')) return false;
      if (/\.(png|jpe?g|gif|svg|webp|ico|css|js|map|json|xml|pdf|zip|woff2?|ttf)$/i.test(p)) return false;
      return true;
    } catch {
      return false;
    }
  }

  private scoreUrlPriority(url: string, inlinkCount: number = 1): number {
    try {
      const parsed = new URL(url);
      const path = parsed.pathname.toLowerCase();
      const segments = path.split('/').filter(Boolean);
      const depthPenalty = segments.length * 0.7;
      const queryPenalty = parsed.search ? 1.5 : 0;
      const detailPenalty = this.isLikelyDetailPage(url) ? 3 : 0;
      const slugPenalty = segments.some((s) => s.length > 24 || (s.match(/-/g) || []).length >= 3) ? 1 : 0;
      const rootBoost = path === '/' ? 1.5 : 0;
      const inlinkBoost = Math.min(3, Math.log2(Math.max(1, inlinkCount)));

      // Lower score means higher priority.
      return depthPenalty + queryPenalty + detailPenalty + slugPenalty - rootBoost - inlinkBoost;
    } catch {
      return 50;
    }
  }

  async crawl(
    startUrl: string,
    maxPages: number = 20,
    maxDepth: number = 2,
    auth: CrawlAuthOptions = {},
    options: { excludePatterns?: string[], privacyPatterns?: string[], useAI?: boolean, seedUrls?: string[] } = {}
  ): Promise<CrawlPage[]> {
    const { excludePatterns = [], privacyPatterns = [], useAI = false, seedUrls = [] } = options;
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

    const levels = new Map<number, string[]>();
    levels.set(0, [startUrl]);
    if (seedUrls.length > 0 && maxDepth >= 1) {
      const normalizedSeeds = [...new Set(seedUrls)]
        .map((u) => {
          try { return new URL(u, startUrl).href.split('#')[0]; } catch { return null; }
        })
        .filter((u): u is string => !!u)
        .filter((u) => u.startsWith(baseUrl))
        .filter((u) => this.isCrawlablePath(u));
      levels.set(1, normalizedSeeds);
    }

    for (let depth = 0; depth <= maxDepth && this.pages.length < maxPages; depth++) {
      const currentLevel = [...(levels.get(depth) || [])];
      const nextLevelCounts = new Map<string, number>();
      const nextNextLevelCounts = new Map<string, number>();
      console.log(`[Crawler] Processing depth ${depth} (${currentLevel.length} urls)`);

      for (const url of currentLevel) {
        if (this.pages.length >= maxPages) break;
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
            metadata: { isPrivateSnippet: isPrivate, depth }
          });

          if (depth < maxDepth) {
            $('a[href]').each((_, el) => {
              const href = $(el).attr('href');
              if (href) {
                try {
                  const absoluteUrl = new URL(href, url).href.split('#')[0];
                  if (absoluteUrl.startsWith(baseUrl) && !this.visited.has(absoluteUrl) && this.isCrawlablePath(absoluteUrl)) {
                    const deferToDepth2 = depth === 0 && this.isLikelyDetailPage(absoluteUrl);
                    if (deferToDepth2 && depth + 2 <= maxDepth) {
                      nextNextLevelCounts.set(absoluteUrl, (nextNextLevelCounts.get(absoluteUrl) || 0) + 1);
                    } else {
                      nextLevelCounts.set(absoluteUrl, (nextLevelCounts.get(absoluteUrl) || 0) + 1);
                    }
                  }
                } catch (e) { /* ignore */ }
              }
            });
          }
        } catch (error) {
          console.error(`Failed to crawl ${url}:`, error instanceof Error ? error.message : String(error));
        }
      }

      if (depth < maxDepth) {
        const rankMap = (m: Map<string, number>) =>
          [...m.entries()]
            .sort((a, b) => this.scoreUrlPriority(a[0], a[1]) - this.scoreUrlPriority(b[0], b[1]))
            .map(([url]) => url);

        // Hard partition after depth 0: keep hub/navigation pages at depth 1,
        // push detail/article pages to depth 2.
        if (depth === 0 && depth + 2 <= maxDepth) {
          const depth1: string[] = [];
          const depth2: string[] = rankMap(nextNextLevelCounts);
          for (const candidate of rankMap(nextLevelCounts)) {
            if (this.isLikelyDetailPage(candidate)) depth2.push(candidate);
            else depth1.push(candidate);
          }
          levels.set(depth + 1, [...new Set(depth1)]);
          levels.set(depth + 2, [...new Set(depth2)]);
        } else {
          levels.set(depth + 1, rankMap(nextLevelCounts));
          if (depth + 2 <= maxDepth) {
            levels.set(depth + 2, rankMap(nextNextLevelCounts));
          }
        }
      }
    }

    return this.pages;
  }
}

export const crawlerService = new CrawlerService();
