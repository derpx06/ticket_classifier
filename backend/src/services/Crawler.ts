import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';

export interface CrawlPage {
  url: string;
  title: string;
  content: string;
}

export class CrawlerService {
  private visited = new Set<string>();
  private pages: CrawlPage[] = [];

  async crawl(startUrl: string, maxPages: number = 20): Promise<CrawlPage[]> {
    this.visited.clear();
    this.pages = [];
    const baseUrl = new URL(startUrl).origin;

    const queue: string[] = [startUrl];

    while (queue.length > 0 && this.pages.length < maxPages) {
      const url = queue.shift()!;
      if (this.visited.has(url)) continue;
      this.visited.add(url);

      try {
        console.log(`Crawling: ${url}`);
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'TicketClassifier-Crawler/1.0',
          },
          timeout: 10000,
        });

        const $ = cheerio.load(response.data);
        const title = $('title').text().trim() || url;
        
        // Extract meaningful text
        $('script, style, nav, footer, header').remove();
        const content = $('body').text().replace(/\s+/g, ' ').trim();

        this.pages.push({ url, title, content });

        // Find links
        $('a[href]').each((_, el) => {
          const href = $(el).attr('href');
          if (href) {
            try {
              const absoluteUrl = new URL(href, url).href;
              // Only crawl same domain
              if (absoluteUrl.startsWith(baseUrl) && !this.visited.has(absoluteUrl)) {
                queue.push(absoluteUrl);
              }
            } catch (e) {
              // Ignore invalid URLs
            }
          }
        });
      } catch (error) {
        console.error(`Failed to crawl ${url}:`, error instanceof Error ? error.message : String(error));
      }
    }

    return this.pages;
  }
}
