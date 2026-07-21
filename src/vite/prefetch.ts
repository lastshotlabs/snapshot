// src/vite/prefetch.ts
import path from "node:path";
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";

/**
 * A single entry in the Vite build manifest.
 * Subset of the full Vite manifest entry shape.
 */
export interface ViteManifestEntry {
  /** Hashed output file path relative to the output directory. */
  readonly file: string;
  /** CSS files imported by this chunk. */
  readonly css?: readonly string[];
  /** Whether this entry is a build entry point. */
  readonly isEntry?: boolean;
  /** Keys of statically imported chunks (used for CSS collection). */
  readonly imports?: readonly string[];
}

/**
 * A single route entry in the prefetch manifest.
 */
export interface PrefetchRoute {
  /** URL pattern in `:param` syntax. */
  readonly pattern: string;
  /** Relative paths to JS chunks for this route. */
  readonly chunks: readonly string[];
  /** Relative paths to CSS files for this route. */
  readonly css: readonly string[];
}

/**
 * The prefetch manifest written to `dist/client/prefetch-manifest.json`.
 * Maps URL patterns to their JS chunk and CSS file URLs so `<PrefetchLink>`
 * can inject `<link rel="prefetch">` tags at hover/viewport time.
 */
export interface PrefetchManifest {
  readonly routes: readonly PrefetchRoute[];
}

/**
 * Convert a file-system route path segment to a URL pattern using `:param` syntax.
 *
 * Transformations applied (in order):
 * - `[...rest]` → `:rest*`   (catch-all)
 * - `[slug]`    → `:slug`    (dynamic segment)
 * - `(group)`   → ``         (route group — stripped from pattern)
 *
 * @param fsPath - Route path relative to the routes directory, without leading slash.
 *   e.g. `posts/[slug].ts`, `(marketing)/about.ts`, `posts/[...rest].ts`
 * @returns URL pattern string, e.g. `/posts/:slug`, `/about`, `/posts/:rest*`
 * @internal
 */
export function routePathToPattern(fsPath: string): string {
  // Strip file extension
  const withoutExt = fsPath.replace(/\.[^.]+$/, "");

  // Split into segments
  const segments = withoutExt.split("/").map((seg) => {
    // Strip route group wrappers like (group)
    if (/^\([^)]+\)$/.test(seg)) return null;

    // Catch-all: [...rest] → :rest*
    const catchAll = seg.match(/^\[\.\.\.([^\]]+)\]$/);
    if (catchAll) return `:${catchAll[1]}*`;

    // Dynamic: [slug] → :slug
    const dynamic = seg.match(/^\[([^\]]+)\]$/);
    if (dynamic) return `:${dynamic[1]}`;

    return seg;
  });

  // Filter nulls (stripped groups), then build the pattern
  const filtered = segments.filter((s): s is string => s !== null);

  // Strip trailing "index" segment
  if (filtered[filtered.length - 1] === "index") {
    filtered.pop();
  }

  const pattern = "/" + filtered.join("/");
  // Collapse duplicate slashes that can occur when groups were stripped
  return pattern.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
}

/**
 * Recursively collect all CSS files reachable from a manifest entry key.
 * Follows the `imports` chain, same as `resolveAssetTags` in slingshot-ssr.
 *
 * @param manifest - The Vite build manifest.
 * @param key - The manifest entry key to start from.
 * @param result - Accumulator set of CSS file paths.
 * @param visited - Visited key set to prevent infinite loops.
 * @internal
 */
function collectCss(
  manifest: Record<string, ViteManifestEntry>,
  key: string,
  result: Set<string>,
  visited: Set<string>,
): void {
  if (visited.has(key)) return;
  visited.add(key);

  const entry = manifest[key];
  if (!entry) return;

  for (const css of entry.css ?? []) result.add(css);
  for (const imp of entry.imports ?? [])
    collectCss(manifest, imp, result, visited);
}

/**
 * Recursively collect all `.ts`/`.tsx`/`.js`/`.jsx` files under a directory.
 *
 * @param dir - Absolute path to the routes directory.
 * @param base - Base directory (same as `dir` on the first call). Used to compute relative paths.
 * @returns Array of relative paths under `dir`, using forward slashes.
 * @internal
 */
async function collectRouteFiles(dir: string, base: string): Promise<string[]> {
  if (!existsSync(dir)) return [];

  const entries = await readdir(dir, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await collectRouteFiles(fullPath, base);
      results.push(...nested);
    } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      // Relative to base, with forward slashes
      results.push(path.relative(base, fullPath).replace(/\\/g, "/"));
    }
  }

  return results;
}

/**
 * Find the Vite manifest entry key that best matches a server route path.
 *
 * Strategy:
 * 1. Normalise the server route path to path-segment tokens (no ext, no brackets).
 * 2. Search manifest keys for a key that contains all the same tokens and references
 *    a `clientRoutesDir` prefix.
 *
 * @param manifest - Parsed Vite manifest.
 * @param serverRelPath - Server route path relative to `serverRoutesDir`, e.g. `posts/[slug].ts`.
 * @param clientRoutesDir - Client routes directory prefix, e.g. `src/routes`.
 * @returns The matching manifest key, or `null` if no match found.
 * @internal
 */
function findManifestKey(
  manifest: Record<string, ViteManifestEntry>,
  serverRelPath: string,
  clientRoutesDir: string,
): string | null {
  // Normalise server path: strip extension, replace dynamic brackets with a placeholder
  const serverNorm = serverRelPath
    .replace(/\.[^.]+$/, "")
    .replace(/\[\.\.\.([^\]]+)\]/g, "$1")
    .replace(/\[([^\]]+)\]/g, "$1")
    .replace(/\(([^)]+)\)/g, "")
    .replace(/\/+/g, "/")
    .replace(/^\/|\/$/g, "");

  const serverTokens = serverNorm.split("/").filter(Boolean);

  // Normalise the client routes dir prefix for comparison
  const normalizedClientDir = clientRoutesDir
    .replace(/\\/g, "/")
    .replace(/\/$/, "");

  for (const key of Object.keys(manifest)) {
    const normalizedKey = key.replace(/\\/g, "/");

    // Key must be under the client routes dir
    if (
      !normalizedKey.startsWith(normalizedClientDir + "/") &&
      normalizedKey !== normalizedClientDir
    ) {
      continue;
    }

    // Normalise manifest key similarly
    const keyNorm = normalizedKey
      .replace(/\.[^.]+$/, "")
      .replace(/\$([^/]+)/g, "$1") // $slug → slug (TanStack Router style)
      .replace(/\[([^\]]+)\]/g, "$1") // [slug] → slug
      .replace(/\(([^)]+)\)/g, "")
      .replace(/\/+/g, "/")
      .replace(/^\/|\/$/g, "");

    const keyTokens = keyNorm.split("/").filter(Boolean);

    // The last N tokens of keyTokens should match serverTokens
    const keyRouteTokens = keyTokens.slice(
      keyTokens.findIndex((t) => t !== normalizedClientDir.split("/").pop()) +
        1,
    );

    // Simpler: just check if the final segment count matches and tokens match
    if (keyRouteTokens.length === serverTokens.length) {
      const matches = serverTokens.every(
        (t, i) => keyRouteTokens[i]?.toLowerCase() === t.toLowerCase(),
      );
      if (matches) return key;
    }
  }

  // Fallback: try a suffix match approach
  const serverSuffix = serverTokens.join("/").toLowerCase();
  for (const key of Object.keys(manifest)) {
    const normalizedKey = key.replace(/\\/g, "/");
    if (!normalizedKey.startsWith(normalizedClientDir + "/")) continue;

    const keyLower = normalizedKey.toLowerCase();
    if (keyLower.includes(serverSuffix)) return key;
  }

  return null;
}

/**
 * Build the prefetch manifest from Vite's build manifest and the server routes directory.
 *
 * The manifest maps each server route's URL pattern to the JS chunks and CSS files
 * that need to be prefetched when a user is likely to navigate to that route.
 *
 * Called by `snapshotSsr()` Vite plugin in its `closeBundle` hook after the client
 * build completes.
 *
 * @param viteManifest - Parsed contents of `.vite/manifest.json`.
 * @param serverRoutesDir - Absolute path to the server routes directory.
 * @param clientRoutesDir - Client routes directory prefix (relative to project root), e.g. `src/routes`.
 * @returns The prefetch manifest object.
 *
 * @example
 * ```ts
 * const manifest = await buildPrefetchManifest(
 *   viteManifest,
 *   '/app/server/routes',
 *   'src/routes',
 * );
 * ```
 */
export async function buildPrefetchManifest(
  viteManifest: Record<string, ViteManifestEntry>,
  serverRoutesDir: string,
  clientRoutesDir: string,
): Promise<PrefetchManifest> {
  const routeFiles = await collectRouteFiles(serverRoutesDir, serverRoutesDir);

  const routes: PrefetchRoute[] = [];

  for (const relPath of routeFiles) {
    const pattern = routePathToPattern(relPath);
    const manifestKey = findManifestKey(viteManifest, relPath, clientRoutesDir);

    if (!manifestKey) {
      routes.push({ pattern, chunks: [], css: [] });
      continue;
    }

    const entry = viteManifest[manifestKey];
    if (!entry) {
      routes.push({ pattern, chunks: [], css: [] });
      continue;
    }

    const chunks: string[] = [entry.file];

    // Collect transitively imported chunks' files
    for (const imp of entry.imports ?? []) {
      const impEntry = viteManifest[imp];
      if (impEntry?.file) chunks.push(impEntry.file);
    }

    const cssSet = new Set<string>();
    collectCss(viteManifest, manifestKey, cssSet, new Set());

    routes.push({
      pattern,
      chunks,
      css: [...cssSet],
    });
  }

  return { routes };
}
