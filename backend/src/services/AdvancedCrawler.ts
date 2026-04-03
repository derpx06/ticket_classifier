import { chromium, Browser, Page as PlaywrightPage } from 'playwright';
import { URL } from 'url';
import { aiCleaner } from './AICleaner';

export interface AdvancedCrawlAuthOptions {
    /** Inject cookies directly (e.g. copied from DevTools) */
    cookies?: Array<{ name: string; value: string; domain?: string; path?: string }>;
    /** Custom HTTP headers to send on every request */
    extraHTTPHeaders?: Record<string, string>;
    /** Automated login: fill a form and submit */
    loginFlow?: {
        loginUrl: string;
        usernameSelector: string;
        passwordSelector: string;
        submitSelector: string;
        username: string;
        password: string;
        /** Optional: selector to wait for after login succeeds */
        waitForSelector?: string;
    };
}

export class AdvancedCrawler {
    private visitedUrls: Set<string> = new Set();
    private pages: any[] = [];

    async crawl(
        startUrl: string,
        maxPages: number = 10,
        auth: AdvancedCrawlAuthOptions = {},
        options: { excludePatterns?: string[], privacyPatterns?: string[], useAI?: boolean } = {}
    ) {
        const { excludePatterns = [], privacyPatterns = [], useAI = false } = options;
        this.visitedUrls.clear();
        this.pages = [];

        // Pre-compile regexes
        const excludeRegexes = excludePatterns.map(p => new RegExp(p, 'i'));
        const privacyRegexes = privacyPatterns.map(p => new RegExp(p, 'i'));

        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({
            userAgent: 'TicketClassifier-AdvancedCrawler/1.0',
            extraHTTPHeaders: auth.extraHTTPHeaders || {},
        });

        // Inject cookies if provided
        if (auth.cookies && auth.cookies.length > 0) {
            const baseDomain = new URL(startUrl).hostname;
            const cookiesWithDomain = auth.cookies.map(c => ({
                ...c,
                domain: c.domain || baseDomain,
                path: c.path || '/',
            }));
            await context.addCookies(cookiesWithDomain);
            console.log(`[Advanced] Injected ${cookiesWithDomain.length} cookies`);
        }

        // Automated login flow
        if (auth.loginFlow) {
            const { loginUrl, username, password, waitForSelector } = auth.loginFlow;
            let { usernameSelector, passwordSelector, submitSelector } = auth.loginFlow;

            console.log(`[Advanced] Performing automated login at ${loginUrl}`);
            const loginPage = await context.newPage();
            try {
                await loginPage.goto(loginUrl, { waitUntil: 'networkidle', timeout: 30000 });

                if (!usernameSelector) {
                    const candidates = ['input[type="email"]', 'input[name="email"]', 'input[name="username"]', 'input[id*="email"]'];
                    for (const sel of candidates) { if (await loginPage.$(sel)) { usernameSelector = sel; break; } }
                }
                if (!passwordSelector) {
                    const candidates = ['input[type="password"]', 'input[name="password"]', 'input[id*="pass"]'];
                    for (const sel of candidates) { if (await loginPage.$(sel)) { passwordSelector = sel; break; } }
                }
                if (!submitSelector) {
                    const candidates = ['button[type="submit"]', 'input[type="submit"]', 'button:has-text("Sign in")', 'button:has-text("Login")'];
                    for (const sel of candidates) { if (await loginPage.$(sel)) { submitSelector = sel; break; } }
                }

                if (usernameSelector && passwordSelector && submitSelector) {
                    await loginPage.fill(usernameSelector, username);
                    await loginPage.fill(passwordSelector, password);
                    await loginPage.click(submitSelector);

                    if (waitForSelector) {
                        await loginPage.waitForSelector(waitForSelector, { timeout: 15000 });
                    } else {
                        await loginPage.waitForLoadState('networkidle');
                    }
                    console.log(`[Advanced] Login complete`);
                }
            } catch (err) {
                console.error("[Advanced] Login error:", err);
            } finally {
                await loginPage.close();
            }
        }

        const queue: string[] = [startUrl];
        const baseDomain = new URL(startUrl).origin;

        while (queue.length > 0 && this.pages.length < maxPages) {
            const url = queue.shift()!;
            if (this.visitedUrls.has(url)) continue;

            // Exclusion check
            if (excludeRegexes.some(re => re.test(url))) {
                console.log(`[Advanced] Skipping excluded URL: ${url}`);
                continue;
            }

            console.log(`[Advanced] Crawling: ${url}`);
            this.visitedUrls.add(url);

            const page = await context.newPage();
            try {
                await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
                await this.autoScroll(page);

                const data = await this.extractContent(page);
                let finalContent = data.content;

                const isPrivate = privacyRegexes.some(re => re.test(url));

                if (useAI) {
                    if (isPrivate) {
                        console.log(`[Advanced] Privacy mode enabled for ${url}. Summarizing...`);
                        finalContent = await aiCleaner.extractKnowledgeWithPrivacy(data.content, url);
                    } else {
                        finalContent = await aiCleaner.extractKnowledge(data.content, url);
                    }
                }

                this.pages.push({
                    url,
                    title: data.title,
                    content: finalContent,
                    metadata: { ...data.metadata, isPrivateSnippet: isPrivate }
                });

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
                    if (totalHeight >= scrollHeight) { clearInterval(timer); resolve(); }
                }, 100);
            });
        });
    }

    private async extractContent(page: PlaywrightPage) {
        const title = await page.title();
        const data = await page.evaluate(() => {
            const selectorsToRemove = ['script', 'style', 'nav', 'footer', 'header', 'aside', 'iframe'];
            selectorsToRemove.forEach(s => document.querySelectorAll(s).forEach(el => el.remove()));
            return {
                text: document.body.innerText,
                buttons: Array.from(document.querySelectorAll('button, a.btn')).map(el => (el as HTMLElement).innerText)
            };
        });

        return {
            title,
            content: data.text,
            metadata: { buttons: data.buttons.filter(b => b.trim().length > 0) }
        };
    }

    private async extractLinks(page: PlaywrightPage, baseDomain: string) {
        return await page.evaluate((domain) => {
            return Array.from(document.querySelectorAll('a[href]'))
                .map(a => (a as HTMLAnchorElement).href)
                .filter(href => href.startsWith(domain))
                .map(href => href.split('#')[0]);
        }, baseDomain);
    }
}

export const advancedCrawler = new AdvancedCrawler();
