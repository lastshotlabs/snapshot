import { runAudits } from "../manifest/audits/runner";
import type { AuditResult } from "../manifest/audits/types";
import { createDefaultConstraintEngine } from "../manifest/constraints";
import type { ConstraintEngine, ConstraintResult } from "../manifest/constraints";
import { type FrontendManifest, frontendManifestSchema } from "../manifest/schema";
import { generateAppEntry } from "./app-entry";
import { generatePages } from "./pages";
import { generateRouteTree } from "./routes";
import { generateThemeCSS } from "./theme";

// ── Types ────────────────────────────────────────────────────────────────────

export interface GenerateOptions {
  /** Custom constraint engine. Defaults to the built-in engine with all rules. */
  constraintEngine?: ConstraintEngine;
  /** Skip constraint checking. */
  skipConstraints?: boolean;
  /** Skip audit checks. */
  skipAudits?: boolean;
}

export interface GenerationSuccess {
  success: true;
  /** Map of filename → generated source code. */
  files: Record<string, string>;
  /** Constraint warnings (non-blocking). */
  constraintWarnings: string[];
  /** Audit findings (non-blocking). */
  auditResults: AuditResult[];
}

export interface GenerationFailure {
  success: false;
  errors: string[];
  constraintResult?: ConstraintResult;
}

export type GenerationResult = GenerationSuccess | GenerationFailure;

// ── Pipeline ─────────────────────────────────────────────────────────────────

/**
 * Generates a complete React application from a frontend manifest.
 *
 * Pipeline:
 *   1. Validate manifest schema (Zod)
 *   2. Check constraints (pluggable rules)
 *   3. Run audits (warnings — non-blocking)
 *   4. Generate output files (pages, routes, theme)
 *
 * Pure function: same manifest → same output, every time.
 *
 * @returns Record<filename, sourceCode> on success.
 */
export function generateApp(rawManifest: unknown, options: GenerateOptions = {}): GenerationResult {
  // ── Phase 1: Schema validation ───────────────────────────────────────────
  const parseResult = frontendManifestSchema.safeParse(rawManifest);
  if (!parseResult.success) {
    const errors = parseResult.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    return { success: false, errors };
  }

  const manifest = parseResult.data;

  // ── Phase 2: Constraint checking ─────────────────────────────────────────
  if (!options.skipConstraints) {
    const engine = options.constraintEngine ?? createDefaultConstraintEngine();
    const constraintResult = engine.check(manifest);

    if (!constraintResult.valid) {
      return {
        success: false,
        errors: constraintResult.errors.map(
          (e) => `[${e.ruleId}] ${e.message}${e.path ? ` at ${e.path}` : ""}`,
        ),
        constraintResult,
      };
    }
  }

  // ── Phase 3: Audits ──────────────────────────────────────────────────────
  const auditResults = options.skipAudits ? [] : runAudits(manifest).results;

  // ── Phase 4: Generate output ─────────────────────────────────────────────
  const files: Record<string, string> = {};

  // Theme CSS
  files["theme.css"] = generateThemeCSS(manifest);

  // App entry — bridges snapshot instance → router context → pages
  files["app.ts"] = generateAppEntry(manifest);

  // Pages
  const pageFiles = generatePages(manifest);
  for (const [filename, content] of Object.entries(pageFiles)) {
    files[filename] = content;
  }

  // Route tree
  files["routeTree.gen.ts"] = generateRouteTree(manifest);

  // Constraint warnings
  const constraintWarnings: string[] = [];
  if (!options.skipConstraints) {
    const engine = options.constraintEngine ?? createDefaultConstraintEngine();
    const result = engine.check(manifest);
    for (const w of result.warnings) {
      constraintWarnings.push(`[${w.ruleId}] ${w.message}${w.path ? ` at ${w.path}` : ""}`);
    }
  }

  return {
    success: true,
    files,
    constraintWarnings,
    auditResults,
  };
}
