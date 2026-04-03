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
        maxPages: number = 10,
        maxDepth: number = 2,
        auth: AdvancedCrawlAuthOptions = {},
        options: {
            excludePatterns?: string[],
            privacyPatterns?: string[],
            useAI?: boolean,
            onPageCrawled?: (page: { url: string, title: string, content: string, metadata: any }) => Promise<void>
        } = {}
    ) {
        const { excludePatterns = [], privacyPatterns = [], useAI = false, onPageCrawled } = options;
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

        const baseDomain = new URL(startUrl).origin;
        const levels = new Map<number, string[]>();
        levels.set(0, [startUrl]);

        for (let depth = 0; depth <= maxDepth && this.pages.length < maxPages; depth++) {
            const currentLevel = levels.get(depth) || [];
            const nextLevelSet = new Set<string>(levels.get(depth + 1) || []);
            const nextNextLevelSet = new Set<string>(levels.get(depth + 2) || []);
            console.log(`[Advanced] Processing depth ${depth} (${currentLevel.length} urls)`);

            for (const url of currentLevel) {
                if (this.pages.length >= maxPages) break;
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

                    const pageData = {
                        url,
                        title: data.title,
                        content: finalContent,
                        metadata: { ...data.metadata, isPrivateSnippet: isPrivate, depth }
                    };
                    this.pages.push(pageData);

                    if (onPageCrawled) {
                        await onPageCrawled(pageData).catch(err =>
                            console.error(`[Advanced] Error in onPageCrawled for ${url}:`, err)
                        );
                    }

                    if (depth < maxDepth) {
                        const links = await this.extractLinks(page, baseDomain);
                        for (const link of links) {
                            if (!this.visitedUrls.has(link) && link.startsWith(baseDomain)) {
                                const deferToDepth2 = depth === 0 && this.isLikelyDetailPage(link);
                                if (deferToDepth2 && depth + 2 <= maxDepth) {
                                    nextNextLevelSet.add(link);
                                } else {
                                    nextLevelSet.add(link);
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error(`Failed to crawl ${url}:`, error);
                } finally {
                    await page.close();
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
