import axios from "axios";
import { URL } from "url";

type SitemapFetchResult = {
  urls: string[];
  fetchedFrom: string[];
};

const extractLocs = (xml: string): string[] => {
  const results: string[] = [];
  const regex = /<loc>([^<]+)<\/loc>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(xml)) !== null) {
    const raw = match[1]?.trim();
    if (raw) results.push(raw);
  }
  return results;
};

const normalizeUrl = (value: string): string | null => {
  try {
    return new URL(value).href.split("#")[0];
  } catch {
    return null;
  }
};

const isSitemapIndex = (xml: string): boolean =>
  /<sitemapindex[^>]*>/i.test(xml);

export async function fetchSitemapUrls(
  baseUrl: string,
  options: { maxUrls?: number; timeoutMs?: number } = {},
): Promise<SitemapFetchResult> {
  const maxUrls = options.maxUrls ?? 5000;
  const timeoutMs = options.timeoutMs ?? 15000;
  const origin = new URL(baseUrl).origin;
  const fetchedFrom: string[] = [];
  const visitedSitemaps = new Set<string>();
  const queue: string[] = [];

  const robotsUrl = `${origin}/robots.txt`;
  try {
    const robots = await axios.get(robotsUrl, { timeout: timeoutMs });
    const matches = String(robots.data || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => /^sitemap:/i.test(line))
      .map((line) => line.split(/:/i).slice(1).join(":").trim());
    matches.forEach((m) => {
      const url = normalizeUrl(m);
      if (url) queue.push(url);
    });
  } catch {
    // ignore robots fetch failures
  }

  if (queue.length === 0) {
    queue.push(`${origin}/sitemap.xml`);
  }

  const collected = new Set<string>();

  while (queue.length > 0 && collected.size < maxUrls) {
    const sitemapUrl = queue.shift();
    if (!sitemapUrl || visitedSitemaps.has(sitemapUrl)) continue;
    visitedSitemaps.add(sitemapUrl);
    fetchedFrom.push(sitemapUrl);

    try {
      const res = await axios.get(sitemapUrl, { timeout: timeoutMs });
      const xml = String(res.data || "");
      const locs = extractLocs(xml)
        .map((u) => normalizeUrl(u))
        .filter((u): u is string => !!u);

      if (isSitemapIndex(xml)) {
        locs.forEach((loc) => {
          if (!visitedSitemaps.has(loc)) queue.push(loc);
        });
      } else {
        locs.forEach((loc) => {
          if (collected.size < maxUrls && loc.startsWith(origin)) {
            collected.add(loc);
          }
        });
      }
    } catch {
      // ignore sitemap fetch failures
    }
  }

  return { urls: Array.from(collected), fetchedFrom };
}
