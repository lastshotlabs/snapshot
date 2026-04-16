import { readFileSync, copyFileSync, existsSync } from "node:fs";
import path from "node:path";
import type { Plugin, ResolvedConfig, UserConfig, ViteDevServer } from "vite";
import { runSync, consoleLogger, type SyncOptions } from "../cli/sync";
import { generateTailwindBridge } from "../ui/tokens/tailwind-bridge";
import { buildPrefetchManifest, type ViteManifestEntry } from "./prefetch";
import { rscTransform } from "./rsc-transform";
import { serverActionsTransform } from "./server-actions";

const VIRTUAL_APP_ENTRY_ID = "virtual:snapshot-entry";
const RESOLVED_VIRTUAL_APP_ENTRY_ID = "\0virtual:snapshot-entry";
const VIRTUAL_GLOBALS_ID = "virtual:snapshot-globals.css";
const RESOLVED_VIRTUAL_GLOBALS_ID = "\0virtual:snapshot-globals.css";

/**
 * Options for `snapshotSync()`, Snapshot's Vite-driven Bunshot sync plugin.
 */
export interface SnapshotSyncOptions {
  /** URL of the bunshot backend. Falls back to VITE_API_URL env var. */
  apiUrl?: string;
  /**
   * Path to a local OpenAPI JSON file. Takes precedence over apiUrl.
   * When provided, the dev server watches this file for changes and re-runs sync automatically.
   * Note: API URL polling is not supported in the Vite plugin — for live schema updates
   * from a running API, use `snapshot sync --watch` from the CLI instead.
   */
  file?: string;
  /** Generate Zod validators alongside mutation hooks. */
  zod?: boolean;
}

/**
 * Options for `snapshotApp()`, the manifest-driven Snapshot app Vite plugin.
 */
export interface SnapshotAppOptions {
  /**
   * Snapshot manifest file to load from the project root.
   * @default 'snapshot.manifest.json'
   */
  manifestFile?: string;
  /**
   * Explicit API URL to pass to `ManifestApp`.
   * Falls back to `import.meta.env.VITE_API_URL` at runtime if omitted.
   */
  apiUrl?: string;
  /**
   * Enable route-aware lazy component loading in ManifestApp.
   * This keeps the virtual entry aligned with the manifest runtime when
   * code-splitting is enabled.
   */
  lazyComponents?: boolean;
}

function normalizeManifestUrl(manifestFile: string): string {
  const normalized = manifestFile.replace(/^\.\/+/, "").replace(/^\/+/, "");
  return `/${normalized || "snapshot.manifest.json"}`;
}

function resolveManifestThemeMode(
  root: string,
  manifestFile: string,
): "light" | "dark" | "system" | undefined {
  try {
    const manifestPath = path.resolve(root, manifestFile);
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
      theme?: { mode?: unknown };
    };
    const mode = manifest.theme?.mode;
    if (mode === "light" || mode === "dark" || mode === "system") {
      return mode;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function getThemeBootScript(
  manifestMode: "light" | "dark" | "system" | undefined,
): string {
  const fallbackMode = manifestMode ?? "system";
  return `(function(){try{var storageKey='snapshot-theme-mode';var fallbackMode=${JSON.stringify(fallbackMode)};var stored=localStorage.getItem(storageKey);var mode=stored==='light'||stored==='dark'||stored==='system'?stored:fallbackMode;var resolved=mode==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):mode;if(resolved==='dark'){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(_error){}})();`;
}

function getSnapshotAppHtml(
  entryId: string,
  options: {
    includeViteClient: boolean;
    manifestMode?: "light" | "dark" | "system";
    stylesheetHrefs?: string[];
  },
): string {
  const stylesheetLinks = (options.stylesheetHrefs ?? [])
    .map((href) => `    <link rel="stylesheet" href="${href}" />`)
    .join("\n");
  const viteClient = options.includeViteClient
    ? '    <script type="module" src="/@vite/client"></script>\n'
    : "";
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Snapshot</title>
    <script>${getThemeBootScript(options.manifestMode)}</script>
${stylesheetLinks ? `${stylesheetLinks}\n` : ""}${viteClient}  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${entryId}"></script>
  </body>
</html>
`;
}

function withBase(base: string, fileName: string): string {
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return `${normalizedBase}${fileName}`.replace(/\/{2,}/g, "/");
}

/**
 * Vite plugin that boots a manifest-driven Snapshot app from
 * `snapshot.manifest.json`.
 *
 * The plugin injects a virtual app entry, wires `ManifestApp`, handles
 * manifest hot reload during development, and emits a static `index.html`
 * during build.
 *
 * @param opts - Manifest app bootstrap options
 * @returns A Vite plugin for serving or building a Snapshot manifest app
 */
export function snapshotApp(opts: SnapshotAppOptions = {}): Plugin {
  const manifestFile = opts.manifestFile ?? "snapshot.manifest.json";
  const manifestUrl = normalizeManifestUrl(manifestFile);
  const apiUrlExpression = opts.apiUrl
    ? JSON.stringify(opts.apiUrl)
    : "import.meta.env.VITE_API_URL ?? window.location.origin";
  let isBuild = false;
  let resolvedBase = "/";
  let manifestMode: "light" | "dark" | "system" | undefined;

  return {
    name: "snapshot-app",
    enforce: "pre",

    async config(userConfig, env) {
      isBuild = env.command === "build";
      manifestMode = resolveManifestThemeMode(
        userConfig.root ?? process.cwd(),
        manifestFile,
      );

      // Auto-inject @tailwindcss/vite if available.
      // Vite's config hook return type is Omit<UserConfig, "plugins">, so we
      // push onto the mutable plugins array instead of returning a new one.
      try {
        const tailwindModule = await import(
          // @ts-ignore — optional peer dep, no type declarations expected
          "@tailwindcss/vite"
        );
        const tailwindVite = (tailwindModule.default ?? tailwindModule) as
          | { default?: () => Plugin }
          | (() => Plugin);
        const tailwindPlugin =
          typeof tailwindVite === "function"
            ? tailwindVite()
            : (tailwindVite as { default?: () => Plugin }).default?.();
        if (tailwindPlugin) {
          (userConfig.plugins ??= []).push(tailwindPlugin);
        }
      } catch {
        // @tailwindcss/vite not installed — Tailwind classes won't work but app still runs
      }

      return {
        resolve: {
          dedupe: [
            "react",
            "react-dom",
            "@tanstack/react-query",
            "@tanstack/react-router",
            "jotai",
            "@unhead/react",
          ],
        },
        ...(isBuild && {
          build: {
            rollupOptions: {
              input: VIRTUAL_APP_ENTRY_ID,
            },
          },
        }),
      };
    },

    configResolved(config: ResolvedConfig) {
      resolvedBase = config.base;
    },

    resolveId(id) {
      if (id === VIRTUAL_APP_ENTRY_ID) {
        return RESOLVED_VIRTUAL_APP_ENTRY_ID;
      }
      if (id === VIRTUAL_GLOBALS_ID) {
        return RESOLVED_VIRTUAL_GLOBALS_ID;
      }
      return null;
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_GLOBALS_ID) {
        return generateTailwindBridge();
      }

      if (id !== RESOLVED_VIRTUAL_APP_ENTRY_ID) {
        return null;
      }

      return `
import "${VIRTUAL_GLOBALS_ID}";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { ManifestApp } from "@lastshotlabs/snapshot/ui";
import manifest from ${JSON.stringify(manifestUrl)};

const apiUrl = ${apiUrlExpression};
const root = document.getElementById("root");
if (!root) {
  throw new Error("Snapshot app shell is missing #root");
}

let snapshotRoot;

function render(nextManifest) {
  if (!snapshotRoot) {
    snapshotRoot = createRoot(root);
  }

  snapshotRoot.render(
    createElement(ManifestApp, {
      manifest: nextManifest,
      apiUrl,
      lazyComponents: ${opts.lazyComponents === true ? "true" : "false"},
    }),
  );
}

render(manifest);

if (import.meta.hot) {
  import.meta.hot.on("snapshot:manifest-update", async (data) => {
    try {
      const mod = await import(/* @vite-ignore */ data.file + "?t=" + data.timestamp);
      render(mod.default);
    } catch (error) {
      console.error("[snapshot] manifest hot reload failed", error);
      import.meta.hot.invalidate();
    }
  });
}
`;
    },

    configureServer(server: ViteDevServer) {
      const serverRoot = server.config?.root ?? process.cwd();

      // Watch the manifest file so handleHotUpdate fires when it changes.
      const manifestAbsPath = path.resolve(serverRoot, manifestFile);
      server.watcher?.add?.(manifestAbsPath);

      // Copy the JSON Schema into the project root so VSCode can resolve
      // "$schema": "./snapshot-schema.json" without cross-directory path issues.
      try {
        const schemaSource = path.resolve(__dirname, "snapshot-schema.json");
        const schemaDest = path.resolve(
          serverRoot,
          "snapshot-schema.json",
        );
        if (existsSync(schemaSource)) {
          copyFileSync(schemaSource, schemaDest);
        }
      } catch {
        // Non-fatal — schema copy is a DX convenience, not a runtime requirement.
      }

      server.middlewares.use(async (req, res, next) => {
        if (!req.url || req.method !== "GET") {
          next();
          return;
        }

        const pathname = req.url.split("?", 1)[0] ?? "/";

        // Let Vite handle actual assets (JS, CSS, source files, HMR, etc.)
        const isAsset =
          pathname.startsWith("/@") ||
          pathname.startsWith("/node_modules/") ||
          pathname.startsWith("/__vite") ||
          /\.\w+$/.test(pathname);

        if (isAsset && pathname !== "/index.html") {
          next();
          return;
        }

        const html = await server.transformIndexHtml(
          pathname,
          getSnapshotAppHtml(`/@id/${VIRTUAL_APP_ENTRY_ID}`, {
            includeViteClient: true,
            manifestMode,
          }),
        );

        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(html);
      });
    },

    handleHotUpdate(context) {
      const manifestPath = path.resolve(
        context.server.config.root,
        manifestFile,
      );
      if (path.resolve(context.file) !== manifestPath) {
        return;
      }

      context.server.ws.send({
        type: "custom",
        event: "snapshot:manifest-update",
        data: {
          file: manifestUrl,
          timestamp: Date.now(),
        },
      });

      return [];
    },

    generateBundle(_options, bundle) {
      if (!isBuild) {
        return;
      }

      const entryChunk = Object.values(bundle).find(
        (chunk) =>
          chunk.type === "chunk" &&
          chunk.isEntry &&
          (chunk.facadeModuleId === RESOLVED_VIRTUAL_APP_ENTRY_ID ||
            chunk.facadeModuleId === VIRTUAL_APP_ENTRY_ID),
      );

      if (!entryChunk || entryChunk.type !== "chunk") {
        return;
      }

      const stylesheetHrefs = Object.values(bundle).flatMap((asset) =>
        asset.type === "asset" && asset.fileName.endsWith(".css")
          ? [withBase(resolvedBase, asset.fileName)]
          : [],
      );

      this.emitFile({
        type: "asset",
        fileName: "index.html",
        source: getSnapshotAppHtml(
          withBase(resolvedBase, entryChunk.fileName),
          {
            includeViteClient: false,
            manifestMode,
            stylesheetHrefs,
          },
        ),
      });
    },
  };
}

/**
 * Vite plugin that runs Snapshot's OpenAPI sync step during the Vite
 * lifecycle.
 *
 * Use this when a frontend project should regenerate API types and hooks
 * from a Bunshot schema file or backend endpoint at startup.
 *
 * @param opts - Sync source and generation options
 * @returns A Vite plugin that invokes Snapshot sync at build start
 */
export function snapshotSync(opts: SnapshotSyncOptions = {}): Plugin {
  const syncOpts: SyncOptions = {
    apiUrl: opts.apiUrl,
    filePath: opts.file,
    zod: opts.zod,
    cwd: process.cwd(),
    logger: consoleLogger,
  };

  return {
    name: "snapshot-sync",

    async buildStart() {
      if (opts.file) {
        const exists = await import("node:fs/promises")
          .then((fs) => fs.access(path.resolve(syncOpts.cwd, opts.file!)))
          .then(() => true)
          .catch(() => false);
        if (!exists) {
          console.warn(
            `[snapshot] ${opts.file} not found — skipping auto-sync. Run \`bun run sync\` or drop a schema file to enable.`,
          );
          return;
        }
      }
      await runSync(syncOpts);
    },

    configureServer(server) {
      if (opts.file) {
        server.watcher.add(opts.file);
        server.watcher.on("change", async (changedFile) => {
          if (changedFile === opts.file || changedFile.endsWith(opts.file!)) {
            // Spread syncOpts so any future fields are included automatically
            await runSync({ ...syncOpts, watch: false }).catch(console.error);
          }
        });
        server.watcher.on("add", async (addedFile) => {
          if (addedFile === opts.file || addedFile.endsWith(opts.file!)) {
            await runSync({ ...syncOpts, watch: false }).catch(console.error);
          }
        });
      }
      // API URL mode: the Vite plugin does not poll the API during dev.
      // For live schema updates from a running API, use `snapshot sync --watch` from the CLI.
      // This is intentional — Vite's watcher is file-based; network polling belongs in the CLI.
    },
  };
}

/**
 * Options for the `snapshotSsr()` Vite plugin.
 */
export interface SnapshotSsrOptions {
  /**
   * Entry module for the client-side hydration bundle.
   * @default 'src/ssr/entry-client.tsx'
   */
  clientEntry?: string;
  /**
   * Entry module for the server-side renderer bundle.
   * @default 'src/ssr/entry-server.ts'
   */
  serverEntry?: string;
  /**
   * Output directory for the server bundle.
   * @default 'dist/server'
   */
  serverOutDir?: string;
  /**
   * Run `bunshot ssg` after the client build completes.
   *
   * When `true`, the `closeBundle` hook spawns `bunshot ssg` using the Vite
   * client manifest produced by this build and the server entry bundle in
   * `serverOutDir`. Pre-rendered HTML files are written to `ssgOutDir`.
   *
   * Requires the server bundle to have been built first
   * (`vite build --ssr`). If the renderer module cannot be found,
   * SSG is skipped with a warning.
   *
   * @default false
   */
  ssg?: boolean;
  /**
   * Output directory for SSG `.html` files.
   * Passed to `bunshot ssg --out`.
   * @default 'dist/static'
   */
  ssgOutDir?: string;
  /**
   * Generate `prefetch-manifest.json` in the client output directory after the
   * client build completes. The manifest maps URL patterns to their JS chunk and
   * CSS file URLs for use with `<PrefetchLink>`.
   * @default true
   */
  prefetchManifest?: boolean;
  /**
   * Absolute path to the server routes directory.
   * Used to enumerate route files when building the prefetch manifest.
   * @default process.cwd() + '/server/routes'
   */
  serverRoutesDir?: string;
  /**
   * Client routes directory prefix relative to the project root.
   * Used to match server route files to their corresponding Vite manifest entries.
   * @default 'src/routes'
   */
  clientRoutesDir?: string;
  /**
   * Enable the `'use server'` directive transform.
   *
   * When `true` (the default), files with a top-level `'use server'` directive
   * are automatically transformed: server builds keep the original code, client
   * builds replace each exported function with a `__callServerAction__` stub.
   *
   * Set to `false` only if you are handling the `'use server'` transform yourself
   * via a separate plugin.
   *
   * @default true
   */
  serverActions?: boolean;

  /**
   * Target runtime for the server bundle.
   *
   * Controls how Vite configures the server build. Affects the build target,
   * SSR format, and which Node.js built-ins are externalized.
   *
   * - `'node'` (default) — Standard Node.js/Bun server. Node built-ins are
   *   externalized; `react` and `react-dom` are externalized.
   * - `'edge-cloudflare'` — Cloudflare Workers. Build target is `es2022`,
   *   SSR target is `webworker` (Service Worker format). Node built-ins are
   *   **not** externalized — they must be polyfilled or avoided entirely.
   *   Asset manifest should be inlined at build time via a Vite plugin.
   * - `'edge-deno'` — Deno Deploy. Build target is `es2022`. Deno supports
   *   most Node.js built-ins via its compatibility layer, so they are still
   *   externalized.
   *
   * @default 'node'
   */
  target?: "node" | "edge-cloudflare" | "edge-deno";

  /**
   * Enable React Server Components (RSC) support.
   *
   * When `true`:
   * - The `rscTransform()` Vite plugin is added to the build pipeline. Files
   *   with a `'use client'` directive are replaced with client reference stubs
   *   in the server bundle and left unchanged in the client bundle.
   * - The server build config gains `resolve.conditions: ['react-server']` so
   *   RSC-aware packages (like `react-server-dom-webpack`) resolve their
   *   server-side entry points.
   * - After the server bundle is assembled, `rsc-manifest.json` is written to
   *   the server output directory. Load this manifest and pass it to
   *   `renderPage()` via `rscOptions` to enable RSC rendering at runtime.
   *
   * Requires `react-server-dom-webpack >=18.3.0` as an optional peer dependency.
   *
   * @default false
   */
  rsc?: boolean;

  /**
   * Open an interactive bundle size visualizer after the client build completes.
   *
   * When `true`, the `rollup-plugin-visualizer` is added to the Vite plugin array
   * and will write `dist/stats.html` after the build, then open it in the browser.
   * If `rollup-plugin-visualizer` is not installed, a warning is logged with the
   * install command.
   *
   * Install the optional dependency:
   * ```sh
   * bun add -d rollup-plugin-visualizer
   * ```
   *
   * @default false
   */
  analyze?: boolean;

  /**
   * Enable Partial Prerendering (PPR) build-time manifest generation.
   *
   * When `true`, the `closeBundle` hook scans the `serverRoutesDir` for route
   * files that export `ppr: true` and writes a `ppr-routes.json` manifest to
   * the client output directory. This manifest is consumed at server startup by
   * `prerenderPprShells()` to pre-compute static shells for all PPR-enabled routes.
   *
   * Shells are NOT pre-computed during the Vite build itself — that requires a
   * running React tree with real loader data and a live database. The manifest
   * only lists which routes opted into PPR so the startup step knows which shells
   * to build. Call `prerenderPprShells()` from `bunshot-ssr/ppr` at server startup
   * after reading this manifest.
   *
   * @default false
   */
  ppr?: boolean;
}

/**
 * Options for `staticParamsPlugin()`.
 * @internal — consumed by `snapshotSsr()`. Not intended for direct use.
 */
interface StaticParamsPluginOptions {
  /**
   * Absolute path to the server routes directory.
   * Defaults to `process.cwd() + '/server/routes'`.
   */
  serverRoutesDir?: string;
  /**
   * The resolved client output directory.
   * `static-params.json` is written here alongside `prefetch-manifest.json`.
   */
  clientOutDir: string;
}

/**
 * Vite plugin that scans the server routes directory for `generateStaticParams`
 * exports at build time and writes `static-params.json` to the client output
 * directory.
 *
 * `static-params.json` is a build-time artifact consumed by the ISR pre-renderer
 * and by deployment tooling. It maps route patterns to their enumerated param sets.
 *
 * This plugin runs during the `buildEnd` hook and only fires for client builds
 * (not the SSR bundle build). It is automatically included in the plugin array
 * returned by `snapshotSsr()` — you do not need to add it manually.
 *
 * @param opts - Plugin configuration.
 * @returns A Vite `Plugin` object.
 *
 * @example Standalone usage (if needed outside snapshotSsr)
 * ```ts
 * import { staticParamsPlugin } from '@lastshotlabs/snapshot/vite'
 *
 * // vite.config.ts
 * export default defineConfig({
 *   plugins: [staticParamsPlugin({ clientOutDir: 'dist/client' })],
 * })
 * ```
 */
export function staticParamsPlugin(opts: StaticParamsPluginOptions): Plugin {
  // Resolved at config time when the Vite UserConfig is available.
  let resolvedClientOutDir = opts.clientOutDir;
  // Whether this is a client (non-SSR) build.
  let isClientBuild = false;

  return {
    name: "snapshot-static-params",

    config(
      config: UserConfig,
      { command, isSsrBuild }: { command: string; isSsrBuild?: boolean },
    ): null {
      if (command === "build") {
        isClientBuild = !isSsrBuild;
        if (!isSsrBuild) {
          resolvedClientOutDir = config.build?.outDir ?? opts.clientOutDir;
        }
      }
      return null;
    },

    async buildEnd(error) {
      // Only run for client builds, and only when the build succeeded.
      if (!isClientBuild || error) return;

      const serverRoutesDir =
        opts.serverRoutesDir ?? path.join(process.cwd(), "server/routes");

      try {
        // Dynamic import so the Vite plugin does not bundle bunshot-ssr into the
        // client bundle — this runs only in the Vite build process (Node/Bun).
        // Typed via structural cast — bunshot-ssr is an optional peer dep of snapshot.
        type StaticParamsModule = {
          scanStaticParams: (dir: string) => Promise<unknown[]>;
          writeStaticParamsManifest: (
            routes: unknown[],
            outDir: string,
          ) => Promise<void>;
        };

        const staticParamsModuleSpecifier =
          "@lastshotlabs/bunshot-ssr/static-params";
        const { scanStaticParams, writeStaticParamsManifest } = (await import(
          /* @vite-ignore */ staticParamsModuleSpecifier
        )) as unknown as StaticParamsModule;

        const routes = await scanStaticParams(serverRoutesDir);
        await writeStaticParamsManifest(routes, resolvedClientOutDir);

        if (routes.length > 0) {
          console.info(
            `[snapshot-static-params] Wrote static-params.json — ${routes.length} route(s) with generateStaticParams.`,
          );
        }
      } catch (err) {
        // Static param scanning is a best-effort build artifact — warn but do
        // not fail the build if bunshot-ssr is not installed or scanning throws.
        console.warn(
          "[snapshot-static-params] Failed to generate static-params.json:",
          err instanceof Error ? err.message : err,
        );
      }
    },
  };
}

/**
 * Vite plugin for SSR builds with Snapshot.
 *
 * When added to the Vite config, it:
 * 1. Enables Vite's manifest output (`build.manifest: true`) for client builds
 *    so that bunshot-ssr can inject hashed asset URLs into the SSR HTML.
 * 2. Configures the server bundle output directory when `vite build --ssr` is run.
 * 3. Generates `dist/client/prefetch-manifest.json` after the client build, mapping
 *    URL patterns to JS chunk and CSS file URLs for `<PrefetchLink>` prefetching.
 *
 * **Two build commands are required:**
 * - `vite build` → client bundle in `dist/client/` + `.vite/manifest.json`
 * - `vite build --ssr` → server bundle in `dist/server/`
 *
 * Add both to your `package.json`:
 * ```json
 * {
 *   "scripts": {
 *     "build:client": "vite build",
 *     "build:server": "vite build --ssr src/ssr/entry-server.ts",
 *     "build": "bun run build:client && bun run build:server"
 *   }
 * }
 * ```
 *
 * @param opts - Optional configuration. All fields have defaults.
 * @returns A Vite `Plugin` object.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from 'vite'
 * import react from '@vitejs/plugin-react'
 * import { snapshotSync, snapshotSsr } from '@lastshotlabs/snapshot/vite'
 *
 * export default defineConfig({
 *   plugins: [
 *     react(),
 *     snapshotSync({ file: './openapi.json' }),
 *     snapshotSsr(),
 *   ],
 * })
 * ```
 */
export function snapshotSsr(opts: SnapshotSsrOptions = {}): Plugin[] {
  if (opts.rsc && opts.ppr) {
    console.warn(
      "[snapshot-ssr] Warning: rsc: true and ppr: true are set simultaneously. " +
        "RSC two-pass rendering is not composed with PPR shells. " +
        "RSC will apply to non-PPR routes only. " +
        "See docs/specs/ssr-rsc-ui-compatibility.md for details.",
    );
  }

  if (opts.rsc && opts.target === "edge-cloudflare") {
    console.warn(
      "[snapshot-ssr] Warning: rsc: true with target: edge-cloudflare is not supported. " +
        "Cloudflare Workers do not support AsyncLocalStorage, which is required by the " +
        "Snapshot cache() primitive used inside server components. " +
        "RSC will be disabled at runtime. Use target: node or target: edge-deno instead.",
    );
  }

  // Track whether this invocation is a client (non-SSR) build so we only
  // run post-build steps after the client build (not after the server bundle build).
  let isClientBuild = false;
  // The resolved client output directory — needed to locate the manifest.
  let clientOutDir = "dist/client";
  // The Vite manifest captured during the build.
  let capturedViteManifest: Record<string, ViteManifestEntry> | null = null;

  const ssrPlugin: Plugin = {
    name: "snapshot-ssr",

    config(
      config: UserConfig,
      { command, isSsrBuild }: { command: string; isSsrBuild?: boolean },
    ): Partial<UserConfig> | null {
      if (command === "build") {
        if (!isSsrBuild) {
          isClientBuild = true;
          clientOutDir = config.build?.outDir ?? "dist/client";
          // Client build: enable manifest + set output directory
          return {
            build: {
              manifest: true,
              outDir: clientOutDir,
            },
          };
        }
        isClientBuild = false;

        const target = opts.target ?? "node";

        // When RSC is enabled, the server build must use the 'react-server' export
        // condition so that RSC-aware packages (react-server-dom-webpack, react) resolve
        // their server entry points (which export renderToPipeableStream for RSC flight).
        const rscConditions: string[] = opts.rsc ? ["react-server"] : [];

        if (target === "edge-cloudflare") {
          // Cloudflare Workers — Service Worker format, ES2022 target.
          // Node built-ins are NOT available and must not be externalized.
          // react/react-dom are still externalized (bundled via import map or
          // inlined depending on the consumer's wrangler.toml config).
          return {
            build: {
              target: "es2022",
              outDir: opts.serverOutDir ?? "dist/server",
              rollupOptions: {
                external: ["react", "react-dom", "react-dom/server"],
              },
            },
            ssr: {
              target: "webworker",
              // Do not externalize Node built-ins — they are not available on
              // Cloudflare Workers. The consumer must avoid or polyfill them.
              noExternal: /^node:/,
            },
            ...(rscConditions.length > 0
              ? { resolve: { conditions: rscConditions } }
              : {}),
          };
        }

        if (target === "edge-deno") {
          // Deno Deploy — ES2022 target. Deno supports most Node built-ins via
          // its compatibility layer, so they can remain external.
          return {
            build: {
              target: "es2022",
              outDir: opts.serverOutDir ?? "dist/server",
              rollupOptions: {
                external: ["react", "react-dom", "react-dom/server"],
              },
            },
            ...(rscConditions.length > 0
              ? { resolve: { conditions: rscConditions } }
              : {}),
          };
        }

        // Default: Node.js / Bun server
        return {
          build: {
            outDir: opts.serverOutDir ?? "dist/server",
            rollupOptions: {
              external: ["react", "react-dom", "react-dom/server"],
            },
          },
          ...(rscConditions.length > 0
            ? { resolve: { conditions: rscConditions } }
            : {}),
        };
      }
      return null;
    },

    generateBundle(_options, bundle) {
      // Capture Vite manifest entries from the bundle for prefetch manifest generation.
      // Only process client builds.
      if (!isClientBuild) return;

      // Vite writes manifest.json to disk, but we can also reconstruct it from the bundle.
      // We collect entry-like chunks to pass to buildPrefetchManifest.
      const manifest: Record<string, ViteManifestEntry> = {};
      for (const [, chunk] of Object.entries(bundle)) {
        if (chunk.type === "chunk" && chunk.facadeModuleId) {
          const key = chunk.facadeModuleId.replace(/\\/g, "/");
          // Strip leading project root prefix if present
          const relKey = key.includes("/src/")
            ? key.slice(key.indexOf("/src/") + 1)
            : key;

          manifest[relKey] = {
            file: chunk.fileName,
            isEntry: chunk.isEntry,
            imports: chunk.imports.map((imp) => {
              // Map import file names back to their keys where possible
              for (const [k, c] of Object.entries(bundle)) {
                if (
                  c.type === "chunk" &&
                  c.fileName === imp &&
                  c.facadeModuleId
                ) {
                  const ik = c.facadeModuleId.replace(/\\/g, "/");
                  return ik.includes("/src/")
                    ? ik.slice(ik.indexOf("/src/") + 1)
                    : ik;
                }
              }
              return imp;
            }),
            css: [],
          };
        }
      }
      if (Object.keys(manifest).length > 0) {
        capturedViteManifest = manifest;
      }
    },

    async closeBundle() {
      // Only run post-build steps after the client build.
      if (!isClientBuild) return;

      // ── Prefetch manifest generation ──────────────────────────────────────
      if (opts.prefetchManifest !== false) {
        const serverRoutesDir =
          opts.serverRoutesDir ?? path.join(process.cwd(), "server/routes");
        const clientRoutesDir = opts.clientRoutesDir ?? "src/routes";

        // Prefer the on-disk Vite manifest (most accurate) over the in-memory capture.
        let viteManifest: Record<string, ViteManifestEntry>;
        const manifestPath = path.join(clientOutDir, ".vite", "manifest.json");

        try {
          const { readFileSync, existsSync } = await import("node:fs");
          if (existsSync(manifestPath)) {
            viteManifest = JSON.parse(
              readFileSync(manifestPath, "utf-8"),
            ) as Record<string, ViteManifestEntry>;
          } else if (capturedViteManifest) {
            viteManifest = capturedViteManifest;
          } else {
            console.warn(
              "[snapshot-ssr] Vite manifest not found — skipping prefetch manifest generation.",
            );
            viteManifest = {};
          }
        } catch {
          viteManifest = capturedViteManifest ?? {};
        }

        try {
          const prefetchManifest = await buildPrefetchManifest(
            viteManifest,
            serverRoutesDir,
            clientRoutesDir,
          );

          const { writeFileSync, mkdirSync } = await import("node:fs");
          mkdirSync(clientOutDir, { recursive: true });
          writeFileSync(
            path.join(clientOutDir, "prefetch-manifest.json"),
            JSON.stringify(prefetchManifest, null, 2),
            "utf-8",
          );
        } catch (err) {
          console.warn(
            "[snapshot-ssr] Failed to generate prefetch manifest:",
            err,
          );
        }
      }

      // ── SSG ───────────────────────────────────────────────────────────────
      if (!opts.ssg) return;

      const serverOutDir = opts.serverOutDir ?? "dist/server";
      const ssgOutDir = opts.ssgOutDir ?? "dist/static";
      const assetsManifest = path.join(clientOutDir, ".vite", "manifest.json");
      const rendererEntry = path.join(serverOutDir, "entry-server.js");

      // Spawn `bunshot-ssg` CLI. Rule 11: use spawnSync with array args — no shell
      // interpolation.
      const ssgArgs = [
        "run",
        path.resolve(process.cwd(), "node_modules/.bin/bunshot-ssg"),
        "--assets-manifest",
        assetsManifest,
        "--out",
        ssgOutDir,
        "--renderer",
        rendererEntry,
      ];

      if (opts.rsc) {
        const rscManifestPath = path.join(serverOutDir, "rsc-manifest.json");
        ssgArgs.push("--rsc-manifest", rscManifestPath);
      }

      const { spawnSync } = await import("node:child_process");
      const result = spawnSync("bun", ssgArgs, {
        cwd: process.cwd(),
        stdio: "inherit",
        encoding: "utf8",
      });

      if (result.error) {
        // CLI binary not found — fall back to direct module invocation
        console.warn(
          "[snapshot-ssr] bunshot-ssg CLI not found — ensure @lastshotlabs/bunshot-ssg is installed.",
          result.error.message,
        );
        return;
      }

      if (result.status !== 0) {
        // SSG failures are warnings, not hard build errors, so the client
        // build artifacts are not invalidated.
        console.warn(
          `[snapshot-ssr] bunshot ssg exited with code ${result.status ?? "null"}. ` +
            `Check the output above for details.`,
        );
      }
    },
  };

  const plugins: Plugin[] = [
    ssrPlugin,
    staticParamsPlugin({ serverRoutesDir: opts.serverRoutesDir, clientOutDir }),
  ];

  // Prepend the server actions transform unless explicitly disabled.
  if (opts.serverActions !== false) {
    plugins.unshift(serverActionsTransform());
  }

  // Prepend the RSC transform when RSC is opted in.
  // rscTransform() must run before serverActionsTransform() so that 'use client'
  // files are stubbed out before 'use server' detection runs on the same file.
  if (opts.rsc) {
    plugins.unshift(rscTransform());
  }

  // Phase 30: bundle analyzer via rollup-plugin-visualizer.
  // The visualizer is an optional peer dep — if not installed, log a helpful message.
  if (opts.analyze) {
    const analyzePlugin: Plugin = {
      name: "snapshot-analyze",
      async closeBundle() {
        // Only run after the client build.
        if (!isClientBuild) return;
        try {
          // Dynamic import — optional peer dep. Cast at the opaque boundary (Rule 5).
          type VisualizerModule = {
            visualizer: (opts?: {
              open?: boolean;
              filename?: string;
              template?: string;
              gzipSize?: boolean;
              brotliSize?: boolean;
            }) => Plugin;
          };
          const { visualizer } = (await import(
            // @ts-ignore — optional peer dep not in devDependencies
            "rollup-plugin-visualizer"
          )) as unknown as VisualizerModule;

          // Build the visualizer plugin and call its generateBundle/closeBundle hooks
          // manually. We can't add it to the plugin array at config time because the
          // analyze option is not known until after the plugin array is constructed.
          const vizPlugin = visualizer({
            open: true,
            filename: path.join(clientOutDir, "stats.html"),
            gzipSize: true,
            brotliSize: true,
          });

          if (typeof vizPlugin.closeBundle === "function") {
            // Call closeBundle to trigger file write + browser open.
            // eslint-disable-next-line @typescript-eslint/await-thenable
            await (vizPlugin.closeBundle as () => void | Promise<void>)();
          }
        } catch {
          console.warn(
            "[snapshot-ssr] Bundle analyzer not available. Install the optional dependency:\n" +
              "  bun add -d rollup-plugin-visualizer\n" +
              "Then re-run the build.",
          );
        }
      },
    };
    plugins.push(analyzePlugin);
  }

  // ── PPR manifest plugin ─────────────────────────────────────────────────────
  // Scans the server routes directory for route files that opt into PPR
  // (`ppr: true` exported from the route module) and writes `ppr-routes.json`
  // to the client output directory. The server startup step reads this manifest
  // and calls `prerenderPprShells()` to pre-compute static shells.
  //
  // NOTE: Shell pre-computation cannot happen during the Vite build because it
  // requires a live React tree with real database connections and loader data.
  // The manifest is a build artifact that enables the server startup step to
  // know which routes need PPR shells without re-scanning the filesystem.
  if (opts.ppr) {
    const pprPlugin: Plugin = {
      name: "snapshot-ppr",

      async closeBundle() {
        // Only run after the client build.
        if (!isClientBuild) return;

        const serverRoutesDir =
          opts.serverRoutesDir ?? path.join(process.cwd(), "server/routes");

        console.log(
          "[snapshot-ssr] PPR: scanning routes for ppr:true exports…",
        );

        // Collect all .ts / .tsx route files recursively from the server routes dir.
        let routeFiles: string[] = [];
        try {
          const { readdir: readdirFn } = await import("node:fs/promises");
          const { existsSync } = await import("node:fs");

          if (!existsSync(serverRoutesDir)) {
            console.warn(
              `[snapshot-ssr] PPR: server routes directory not found: ${serverRoutesDir}`,
            );
            return;
          }

          // Recursive directory walker — avoids shell interpolation (Rule 3).
          async function collectRouteFiles(dir: string): Promise<string[]> {
            const entries = await readdirFn(dir, { withFileTypes: true });
            const collected: string[] = [];
            for (const entry of entries) {
              const fullPath = path.join(dir, entry.name);
              if (entry.isDirectory()) {
                const nested = await collectRouteFiles(fullPath);
                collected.push(...nested);
              } else if (
                entry.isFile() &&
                (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) &&
                // Exclude convention files — only plain route entry files
                !entry.name.startsWith("layout") &&
                !entry.name.startsWith("loading") &&
                !entry.name.startsWith("error") &&
                !entry.name.startsWith("not-found") &&
                !entry.name.startsWith("middleware") &&
                !entry.name.startsWith("meta")
              ) {
                collected.push(fullPath);
              }
            }
            return collected;
          }

          routeFiles = await collectRouteFiles(serverRoutesDir);
        } catch (err) {
          console.warn(
            "[snapshot-ssr] PPR: failed to scan server routes directory:",
            err,
          );
          return;
        }

        // Inspect each route file's source text for a `ppr: true` export.
        // We use a lightweight regex scan rather than importing the module
        // (build-time modules may have side effects or missing dependencies).
        //
        // Patterns matched:
        //   export const ppr = true
        //   export const experimental_ppr = true
        //   ppr: true   (inside a defineRoute({}) call)
        const PPR_PATTERN =
          /\bppr\s*[=:]\s*true\b|experimental_ppr\s*[=:]\s*true\b/;

        const pprRoutes: Array<{ path: string; filePath: string }> = [];

        const { readFileSync } = await import("node:fs");

        for (const filePath of routeFiles) {
          let source: string;
          try {
            source = readFileSync(filePath, "utf-8");
          } catch {
            continue;
          }

          if (!PPR_PATTERN.test(source)) continue;

          // Derive the URL path from the file path relative to serverRoutesDir.
          // e.g. /app/server/routes/dashboard/index.ts → /dashboard
          const relative =
            filePath
              .slice(serverRoutesDir.length)
              .replace(/\\/g, "/")
              .replace(/\/(index)?\.(ts|tsx)$/, "")
              .replace(/\/\[([^\]]+)\]/g, "/:$1") || // [slug] → :slug
            "/";

          pprRoutes.push({ path: relative, filePath });
          console.log(`[snapshot-ssr] PPR:   found ppr:true in ${relative}`);
        }

        if (pprRoutes.length === 0) {
          console.log(
            "[snapshot-ssr] PPR: no PPR-enabled routes found — skipping ppr-routes.json.",
          );
          return;
        }

        // Write ppr-routes.json to the client output directory.
        // The manifest schema is intentionally minimal — only path and filePath
        // are needed by the server startup step.
        const manifest = Object.freeze({
          version: 1,
          generatedAt: new Date().toISOString(),
          routes: pprRoutes.map((r) =>
            Object.freeze({ path: r.path, filePath: r.filePath }),
          ),
        });

        try {
          const { writeFileSync, mkdirSync } = await import("node:fs");
          mkdirSync(clientOutDir, { recursive: true });
          writeFileSync(
            path.join(clientOutDir, "ppr-routes.json"),
            JSON.stringify(manifest, null, 2),
            "utf-8",
          );
          console.log(
            `[snapshot-ssr] PPR: wrote ppr-routes.json with ${pprRoutes.length} route(s) to ${clientOutDir}`,
          );
          console.log(
            "[snapshot-ssr] PPR: call prerenderPprShells() at server startup to pre-compute shells.",
          );
        } catch (err) {
          console.warn(
            "[snapshot-ssr] PPR: failed to write ppr-routes.json:",
            err,
          );
        }
      },
    };
    plugins.push(pprPlugin);
  }

  return plugins;
}
