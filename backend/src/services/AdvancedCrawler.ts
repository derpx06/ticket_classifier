import { chromium, Browser, Page as PlaywrightPage } from 'playwright';
import { URL } from 'url';


export class AdvancedCrawler {
    private visitedUrls: Set<string> = new Set();
    private pages: any[] = [];

    async crawl(startUrl: string, maxPages: number = 10) {
        this.visitedUrls.clear();
        this.pages = [];

        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({
            userAgent: 'TicketClassifier-AdvancedCrawler/1.0',
        });

        const queue: string[] = [startUrl];
        const baseDomain = new URL(startUrl).origin;

        while (queue.length > 0 && this.pages.length < maxPages) {
            const url = queue.shift()!;
            if (this.visitedUrls.has(url)) continue;

            console.log(`[Advanced] Crawling: ${url}`);
            this.visitedUrls.add(url);

            const page = await context.newPage();
            try {
                // Go to URL and wait for network to be idle (ensures JS is rendered)
                await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

                // Auto-scroll to trigger lazy loading
                await this.autoScroll(page);

                // Extract content
                const content = await this.extractContent(page);
                this.pages.push({ url, ...content });

                // Extract links
                const links = await this.extractLinks(page, baseDomain);
                for (const link of links) {
                    if (!this.visitedUrls.has(link) && link.startsWith(baseDomain)) {
                        queue.push(link);
                    }
                }
            } catch (error) {
                console.error(`Failed to crawl ${url}:`, error);
            } finally {
                await page.close();
            }
        }

        await browser.close();
        return this.pages;
    }

    private async autoScroll(page: PlaywrightPage) {
        await page.evaluate(async () => {
            await new Promise<void>((resolve) => {
                let totalHeight = 0;
                const distance = 100;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= scrollHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });
    }

    private async extractContent(page: PlaywrightPage) {
        const title = await page.title();

        // Get all visible text, including aria-labels and alt text
        const data = await page.evaluate(() => {
            // Helper to get descriptive text for elements
            const getDescriptiveText = (el: HTMLElement) => {
                let text = el.innerText || "";
                const ariaLabel = el.getAttribute('aria-label');
                const titleAttr = el.getAttribute('title');
                const altAttr = el.getAttribute('alt');

                if (ariaLabel) text += ` (Label: ${ariaLabel})`;
                if (titleAttr) text += ` (Title: ${titleAttr})`;
                if (altAttr) text += ` (Alt: ${altAttr})`;
                return text;
            };

            // Clean the DOM to avoid noise
            const selectorsToRemove = ['script', 'style', 'nav', 'footer', 'header', 'aside', 'iframe', 'noscript'];
            selectorsToRemove.forEach(s => {
                document.querySelectorAll(s).forEach(el => el.remove());
            });

            return {
                text: document.body.innerText,
                // We could also extract specific components like buttons
                buttons: Array.from(document.querySelectorAll('button, a.btn, .button')).map(el => getDescriptiveText(el as HTMLElement))
            };
        });

        return {
            title,
            content: data.text,
            metadata: {
                buttons: data.buttons.filter(b => b.trim().length > 0)
            }
        };
    }

    private async extractLinks(page: PlaywrightPage, baseDomain: string) {
        const links = await page.evaluate((domain) => {
            return Array.from(document.querySelectorAll('a[href]'))
                .map(a => (a as HTMLAnchorElement).href)
                .filter(href => href.startsWith(domain))
                .map(href => href.split('#')[0]); // Remove fragments
        }, baseDomain);

        return Array.from(new Set(links));
    }
}

export const advancedCrawler = new AdvancedCrawler();
