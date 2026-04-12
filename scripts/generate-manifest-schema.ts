/**
 * Generates dist/snapshot-schema.json from the manifest Zod schema.
 *
 * Run: bun run scripts/generate-manifest-schema.ts
 * This runs automatically as part of `bun run build`.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { zodToJsonSchema } from "zod-to-json-schema";

import { registerBuiltInComponents } from "../src/ui/components/register";
import {
  manifestConfigSchema,
  getRegisteredSchemas,
} from "../src/ui/manifest/schema";
import { generateManifestSchema } from "../src/schema-generator";

registerBuiltInComponents();

// ── Build icon enum from the icon paths registry ────────────────────────────
const iconPathsSrc = readFileSync(
  path.resolve(import.meta.dir, "../src/ui/icons/paths.ts"),
  "utf8",
);
const ICON_NAMES: string[] = [
  ...iconPathsSrc.matchAll(/^\s+"([a-z0-9-]+)":/gm),
].map((m) => m[1]!);

// ── Generate the schema using the shared generator ──────────────────────────
const outDir = path.resolve(import.meta.dir, "../dist");
mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "snapshot-schema.json");

generateManifestSchema({ outPath, iconNames: ICON_NAMES });
console.log(`[snapshot] Generated ${outPath}`);
