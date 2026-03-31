import type { FrontendManifest } from "../schema";

export type AuditSeverity = "error" | "warning" | "info";

export interface AuditResult {
  ruleId: string;
  severity: AuditSeverity;
  message: string;
  path?: string;
  suggestion?: string;
  /** Partial manifest that fixes the issue when deep-merged with the original. */
  patch?: Partial<FrontendManifest>;
}

export interface AuditRule {
  id: string;
  category: "accessibility" | "ux" | "performance" | "security" | "consistency";
  check(manifest: FrontendManifest): AuditResult[];
}
