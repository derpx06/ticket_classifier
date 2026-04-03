import fs from "fs";
import path from "path";

export type RouteType = "app-page" | "app-api" | "pages-page" | "pages-api";

export type RouteEntry = {
  route: string;
  type: RouteType;
  source: string;
  router: "app" | "pages";
  dynamic: boolean;
  catchAll: boolean;
  params: string[];
};

export type RouteMap = {
  projectRoot: string;
  generatedAt: string;
  counts: {
    total: number;
    appPages: number;
    appApis: number;
    pagesPages: number;
    pagesApis: number;
    dynamic: number;
    catchAll: number;
  };
  routes: RouteEntry[];
};

const CODE_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mdx"]);
const IGNORE_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "dist",
  "build",
  "out",
  "coverage",
]);

function isCodeFile(filePath: string): boolean {
  return CODE_EXTS.has(path.extname(filePath).toLowerCase());
}

function walkFiles(rootDir: string): string[] {
  const out: string[] = [];
  const stack = [rootDir];
  while (stack.length > 0) {
    const current = stack.pop() as string;
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      const name = path.basename(current);
      if (IGNORE_DIRS.has(name)) continue;
      for (const child of fs.readdirSync(current)) {
        stack.push(path.join(current, child));
      }
      continue;
    }
    if (isCodeFile(current)) out.push(current);
  }
  return out;
}

function normalizeRouteSegments(segments: string[]) {
  const params: string[] = [];
  let dynamic = false;
  let catchAll = false;

  const normalized = segments
    .filter((segment) => segment !== "")
    .filter((segment) => !segment.startsWith("@")) // parallel route slot
    .filter((segment) => !(/^\(.*\)$/.test(segment))) // route groups + interception group syntax
    .map((segment) => {
      if (/^\[\.\.\.(.+)\]$/.test(segment)) {
        const m = segment.match(/^\[\.\.\.(.+)\]$/);
        const param = (m?.[1] || "slug").trim();
        params.push(param);
        dynamic = true;
        catchAll = true;
        return `*${param}`;
      }
      if (/^\[\[\.\.\.(.+)\]\]$/.test(segment)) {
        const m = segment.match(/^\[\[\.\.\.(.+)\]\]$/);
        const param = (m?.[1] || "slug").trim();
        params.push(param);
        dynamic = true;
        catchAll = true;
        return `*${param}?`;
      }
      if (/^\[(.+)\]$/.test(segment)) {
        const m = segment.match(/^\[(.+)\]$/);
        const param = (m?.[1] || "id").trim();
        params.push(param);
        dynamic = true;
        return `:${param}`;
      }
      return segment;
    });

  return { normalized, params, dynamic, catchAll };
}

function toRoutePath(segments: string[]): string {
  if (segments.length === 0) return "/";
  return `/${segments.join("/")}`;
}

function relativeFrom(projectRoot: string, filePath: string): string {
  return path.relative(projectRoot, filePath).replace(/\\/g, "/");
}

function parseAppRoute(projectRoot: string, appDir: string, filePath: string): RouteEntry | null {
  const rel = relativeFrom(appDir, filePath); // e.g. blog/[id]/page.tsx
  const parts = rel.split("/");
  const fileName = parts[parts.length - 1] || "";
  const ext = path.extname(fileName);
  const base = fileName.slice(0, fileName.length - ext.length);

  if (base !== "page" && base !== "route") return null;

  const folderSegments = parts.slice(0, -1);
  const { normalized, params, dynamic, catchAll } = normalizeRouteSegments(folderSegments);

  if (base === "route") {
    // App API route must be under app/api
    if (normalized[0] !== "api") return null;
    const route = toRoutePath(normalized);
    return {
      route,
      type: "app-api",
      source: relativeFrom(projectRoot, filePath),
      router: "app",
      dynamic,
      catchAll,
      params,
    };
  }

  const route = toRoutePath(normalized);
  return {
    route,
    type: "app-page",
    source: relativeFrom(projectRoot, filePath),
    router: "app",
    dynamic,
    catchAll,
    params,
  };
}

function parsePagesRoute(projectRoot: string, pagesDir: string, filePath: string): RouteEntry | null {
  const rel = relativeFrom(pagesDir, filePath); // e.g. api/user/[id].ts or about.tsx
  const ext = path.extname(rel);
  const noExt = rel.slice(0, rel.length - ext.length);
  const parts = noExt.split("/");
  const isApi = parts[0] === "api";

  if (!isApi && (parts[0] === "_app" || parts[0] === "_document" || parts[0] === "_error")) {
    return null;
  }

  const cleanSegments = parts
    .filter((segment) => segment !== "index")
    .filter((segment) => segment !== "");

  const { normalized, params, dynamic, catchAll } = normalizeRouteSegments(cleanSegments);
  const route = toRoutePath(normalized);

  return {
    route,
    type: isApi ? "pages-api" : "pages-page",
    source: relativeFrom(projectRoot, filePath),
    router: "pages",
    dynamic,
    catchAll,
    params,
  };
}

function dedupeRoutes(routes: RouteEntry[]): RouteEntry[] {
  const seen = new Set<string>();
  const out: RouteEntry[] = [];
  for (const route of routes) {
    const key = `${route.type}::${route.route}::${route.source}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(route);
  }
  return out;
}

export function createRouteMap(projectRootInput: string): RouteMap {
  const projectRoot = path.resolve(projectRootInput);
  if (!fs.existsSync(projectRoot)) {
    throw new Error(`Project path does not exist: ${projectRoot}`);
  }

  const appDir = path.join(projectRoot, "app");
  const pagesDir = path.join(projectRoot, "pages");
  const srcAppDir = path.join(projectRoot, "src", "app");
  const srcPagesDir = path.join(projectRoot, "src", "pages");

  const appRoots = [appDir, srcAppDir].filter((p) => fs.existsSync(p) && fs.statSync(p).isDirectory());
  const pagesRoots = [pagesDir, srcPagesDir].filter((p) => fs.existsSync(p) && fs.statSync(p).isDirectory());

  const routes: RouteEntry[] = [];

  for (const root of appRoots) {
    const files = walkFiles(root);
    for (const filePath of files) {
      const route = parseAppRoute(projectRoot, root, filePath);
      if (route) routes.push(route);
    }
  }

  for (const root of pagesRoots) {
    const files = walkFiles(root);
    for (const filePath of files) {
      const route = parsePagesRoute(projectRoot, root, filePath);
      if (route) routes.push(route);
    }
  }

  const finalRoutes = dedupeRoutes(routes).sort((a, b) => {
    if (a.route === b.route) return a.type.localeCompare(b.type);
    return a.route.localeCompare(b.route);
  });

  const counts = {
    total: finalRoutes.length,
    appPages: finalRoutes.filter((r) => r.type === "app-page").length,
    appApis: finalRoutes.filter((r) => r.type === "app-api").length,
    pagesPages: finalRoutes.filter((r) => r.type === "pages-page").length,
    pagesApis: finalRoutes.filter((r) => r.type === "pages-api").length,
    dynamic: finalRoutes.filter((r) => r.dynamic).length,
    catchAll: finalRoutes.filter((r) => r.catchAll).length,
  };

  return {
    projectRoot,
    generatedAt: new Date().toISOString(),
    counts,
    routes: finalRoutes,
  };
}

export function summarizeRouteMap(routeMap: RouteMap): string {
  const totalPages = routeMap.counts.appPages + routeMap.counts.pagesPages;
  const staticPages = routeMap.routes.filter((r) => (r.type === "app-page" || r.type === "pages-page") && !r.dynamic).length;
  const dynamicPages = routeMap.routes.filter((r) => (r.type === "app-page" || r.type === "pages-page") && r.dynamic).length;
  const apiTotal = routeMap.counts.appApis + routeMap.counts.pagesApis;
  const topRoutes = routeMap.routes
    .filter((r) => r.type === "app-page" || r.type === "pages-page")
    .slice(0, 15)
    .map((r) => r.route)
    .join(", ");

  return [
    `Sitemap generated from codebase at ${routeMap.projectRoot}.`,
    `Total routes: ${routeMap.counts.total}.`,
    `Page routes: ${totalPages} (static: ${staticPages}, dynamic: ${dynamicPages}).`,
    `API routes: ${apiTotal}.`,
    `Dynamic/catch-all routes detected: ${routeMap.counts.dynamic}/${routeMap.counts.catchAll}.`,
    topRoutes ? `Representative pages: ${topRoutes}.` : "No page routes found.",
  ].join(" ");
}

export function routeMapToSitemapPages(routeMap: RouteMap, baseUrl?: string) {
  const pages = routeMap.routes
    .filter((r) => r.type === "app-page" || r.type === "pages-page")
    .map((route) => {
      const url = baseUrl
        ? `${baseUrl.replace(/\/+$/, "")}${route.route}`
        : route.route;
      return {
        title: route.route,
        url,
        dynamic: route.dynamic,
        source: route.source,
        params: route.params,
      };
    });
  return pages;
}

function parseArgs(argv: string[]) {
  const args = argv.slice(2);
  const targetPath = args[0];
  if (!targetPath) {
    throw new Error("Usage: ts-node src/utils/mapNextRoutes.ts <next-project-path> [--out <file>]");
  }

  let outPath: string | null = null;
  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--out" && args[i + 1]) {
      outPath = path.resolve(args[i + 1]);
      i++;
    }
  }

  return { targetPath, outPath };
}

async function main() {
  const { targetPath, outPath } = parseArgs(process.argv);
  const routeMap = createRouteMap(targetPath);

  const json = JSON.stringify(routeMap, null, 2);
  if (outPath) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, json, "utf-8");
    console.log(`Route map written to ${outPath}`);
  }

  console.log(json);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
