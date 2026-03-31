import type { FrontendManifest } from "../schema";
import { builtinAuditRules } from "./rules";
import type { AuditResult, AuditRule } from "./types";

export interface AuditRunnerResult {
  results: AuditResult[];
  errors: AuditResult[];
  warnings: AuditResult[];
  info: AuditResult[];
  hasErrors: boolean;
}

/**
 * Runs audit rules against a frontend manifest.
 *
 * @param manifest The validated manifest to audit.
 * @param rules Optional custom rules. Defaults to all built-in rules.
 * @returns Categorized audit results.
 */
export function runAudits(manifest: FrontendManifest, rules?: AuditRule[]): AuditRunnerResult {
  const activeRules = rules ?? builtinAuditRules;
  const results: AuditResult[] = [];

  for (const rule of activeRules) {
    const ruleResults = rule.check(manifest);
    results.push(...ruleResults);
  }

  const errors = results.filter((r) => r.severity === "error");
  const warnings = results.filter((r) => r.severity === "warning");
  const info = results.filter((r) => r.severity === "info");

  return {
    results,
    errors,
    warnings,
    info,
    hasErrors: errors.length > 0,
  };
}
