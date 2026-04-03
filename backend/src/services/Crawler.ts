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
  private isCrawlablePath(url: string): boolean {
    try {
      const u = new URL(url);
      const p = u.pathname.toLowerCase();
      if (p.startsWith('/api/')) return false;
      if (/\.(png|jpe?g|gif|svg|webp|ico|css|js|map|json|xml|pdf|zip|woff2?|ttf)$/i.test(p)) return false;
      return true;
    } catch {
      return false;
    }
  }

  private normalizeCandidate(candidate: string, base: string): string | null {
    if (!candidate) return null;
    const raw = candidate.trim();
    if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('javascript:')) {
      return null;
    }
    try {
      const href = new URL(raw, base).href.split('#')[0];
      return href;
    } catch {
      return null;
    }
  }

  private extractLinksFromHtml(html: string, currentUrl: string, baseUrl: string): string[] {
    const links = new Set<string>();
    const $ = cheerio.load(html);

    const pushCandidate = (candidate?: string | null) => {
      if (!candidate) return;
      const normalized = this.normalizeCandidate(candidate, currentUrl);
      if (!normalized) return;
      if (!normalized.startsWith(baseUrl)) return;
      if (!this.isCrawlablePath(normalized)) return;
      links.add(normalized);
    };

    $('a[href]').each((_, el) => pushCandidate($(el).attr('href')));
    $('[data-href]').each((_, el) => pushCandidate($(el).attr('data-href')));
    $('[data-url]').each((_, el) => pushCandidate($(el).attr('data-url')));
    $('link[rel="next"], link[rel="prev"]').each((_, el) => pushCandidate($(el).attr('href')));

    const inlineCode = $('script').map((_, el) => $(el).html() || '').get().join('\n');
    for (const m of inlineCode.matchAll(/router\.(?:push|replace)\(\s*["'`]([^"'`]+)["'`]/g)) pushCandidate(m[1]);
    for (const m of inlineCode.matchAll(/location(?:\.href)?\s*=\s*["'`]([^"'`]+)["'`]/g)) pushCandidate(m[1]);

    return [...links];
  }

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

  async crawl(
    startUrl: string,
    maxPages: number = 20,
    maxDepth: number = 2,
    auth: CrawlAuthOptions = {},
    options: {
      excludePatterns?: string[],
      privacyPatterns?: string[],
      useAI?: boolean,
      onPageCrawled?: (page: CrawlPage) => Promise<void>
    } = {}
  ): Promise<CrawlPage[]> {
    const { excludePatterns = [], privacyPatterns = [], useAI = false, onPageCrawled } = options;
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

    for (let depth = 0; depth <= maxDepth && this.pages.length < maxPages; depth++) {
      const currentLevel = levels.get(depth) || [];
      const nextLevelSet = new Set<string>(levels.get(depth + 1) || []);
      const nextNextLevelSet = new Set<string>(levels.get(depth + 2) || []);
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

          const pageData = {
            url,
            title,
            content: finalContent,
            metadata: { isPrivateSnippet: isPrivate, depth }
          };
          this.pages.push(pageData);

          if (onPageCrawled) {
            await onPageCrawled(pageData).catch(err =>
              console.error(`[Crawler] Error in onPageCrawled for ${url}:`, err)
            );
          }

          if (depth < maxDepth) {
            const discoveredLinks = this.extractLinksFromHtml(response.data, url, baseUrl);
            for (const absoluteUrl of discoveredLinks) {
              if (!this.visited.has(absoluteUrl)) {
                const deferToDepth2 = depth === 0 && this.isLikelyDetailPage(absoluteUrl);
                if (deferToDepth2 && depth + 2 <= maxDepth) {
                  nextNextLevelSet.add(absoluteUrl);
                } else {
                  nextLevelSet.add(absoluteUrl);
                }
              }
            }
          }
        } catch (error) {
          console.error(`Failed to crawl ${url}:`, error instanceof Error ? error.message : String(error));
        }
      }

      if (depth < maxDepth) {
        // Hard partition after depth 0: keep hub/navigation pages at depth 1,
        // push detail/article pages to depth 2.
        if (depth === 0 && depth + 2 <= maxDepth) {
          const depth1: string[] = [];
          const depth2: string[] = [...nextNextLevelSet];
          for (const candidate of nextLevelSet) {
            if (this.isLikelyDetailPage(candidate)) depth2.push(candidate);
            else depth1.push(candidate);
          }
          levels.set(depth + 1, depth1);
          levels.set(depth + 2, [...new Set(depth2)]);
        } else {
          levels.set(depth + 1, [...nextLevelSet]);
          if (depth + 2 <= maxDepth) {
            levels.set(depth + 2, [...nextNextLevelSet]);
          }
        }
      }
    }

    return this.pages;
  }
}

export const crawlerService = new CrawlerService();
