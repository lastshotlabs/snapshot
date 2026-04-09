import path from "node:path";
import type { Plugin, UserConfig } from "vite";
import { runSync, consoleLogger, type SyncOptions } from "../cli/sync";

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
}

/**
 * Vite plugin for SSR builds with Snapshot.
 *
 * When added to the Vite config, it:
 * 1. Enables Vite's manifest output (`build.manifest: true`) for client builds
 *    so that bunshot-ssr can inject hashed asset URLs into the SSR HTML.
 * 2. Configures the server bundle output directory when `vite build --ssr` is run.
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
export function snapshotSsr(opts: SnapshotSsrOptions = {}): Plugin {
  return {
    name: "snapshot-ssr",

    config(
      config: UserConfig,
      { command, isSsrBuild }: { command: string; isSsrBuild?: boolean },
    ): Partial<UserConfig> | null {
      if (command === "build") {
        if (!isSsrBuild) {
          // Client build: enable manifest + set output directory
          return {
            build: {
              manifest: true,
              outDir: config.build?.outDir ?? "dist/client",
            },
          };
        }
        // SSR build: set server output directory and externalize React
        return {
          build: {
            outDir: opts.serverOutDir ?? "dist/server",
            rollupOptions: {
              external: ["react", "react-dom", "react-dom/server"],
            },
          },
        };
      }
      return null;
    },
  };
}
