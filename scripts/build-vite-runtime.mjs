import { mkdirSync, existsSync, copyFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "tsup";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const outDir = path.join(projectRoot, "dist");

await build({
  config: false,
  entry: { vite: path.join(projectRoot, "src/vite/index.ts") },
  format: ["esm", "cjs"],
  outExtension: ({ format }) => ({
    js: format === "cjs" ? ".cjs" : ".js",
  }),
  dts: false,
  sourcemap: false,
  clean: false,
  target: "node20",
  platform: "node",
  bundle: true,
  noExternal: ["@clack/prompts"],
  external: [
    "vite",
    "node:fs",
    "node:fs/promises",
    "node:path",
    "node:os",
    "node:child_process",
    "node:url",
    "node:process",
    "node:crypto",
  ],
  outDir,
});

const schemaSource = path.join(projectRoot, "dist", "snapshot-schema.json");
const schemaFallback = path.join(projectRoot, "snapshot-schema.json");
mkdirSync(outDir, { recursive: true });

if (existsSync(schemaFallback)) {
  copyFileSync(schemaFallback, path.join(outDir, "snapshot-schema.json"));
} else if (existsSync(schemaSource)) {
  copyFileSync(schemaSource, path.join(outDir, "snapshot-schema.json"));
}

writeFileSync(
  path.join(outDir, "vite.d.ts"),
  `import type { Plugin } from "vite";

export interface SnapshotAppOptions {
  manifestFile?: string;
  apiUrl?: string;
}

export interface SnapshotSyncOptions {
  apiUrl?: string;
  file?: string;
  zod?: boolean;
}

export interface SnapshotSsrOptions {
  clientEntry?: string;
  serverEntry?: string;
  serverOutDir?: string;
  ssg?: boolean;
  ssgOutDir?: string;
  prefetchManifest?: boolean;
  serverRoutesDir?: string;
  clientRoutesDir?: string;
  serverActions?: boolean;
  target?: "node" | "edge-cloudflare" | "edge-deno";
  rsc?: boolean;
}

export declare function snapshotApp(opts?: SnapshotAppOptions): Plugin;
export declare function snapshotSync(opts?: SnapshotSyncOptions): Plugin;
export declare function snapshotSsr(opts?: SnapshotSsrOptions): Plugin[];
`,
);
