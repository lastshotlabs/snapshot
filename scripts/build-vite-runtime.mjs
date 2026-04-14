import { mkdirSync, existsSync, copyFileSync } from "node:fs";
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
