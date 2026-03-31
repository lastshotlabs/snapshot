import type { FrontendManifest } from "../schema";
import { walkAllComponents } from "../walk";
import type { AuditResult, AuditRule } from "./types";

// ── Accessibility rules ──────────────────────────────────────────────────────

export const formLabels: AuditRule = {
  id: "accessibility/form-labels",
  category: "accessibility",
  check(manifest) {
    const results: AuditResult[] = [];
    walkAllComponents(manifest, (comp, path) => {
      if (comp.type === "form" && comp.fields && Array.isArray(comp.fields)) {
        for (let i = 0; i < comp.fields.length; i++) {
          const field = comp.fields[i] as Record<string, unknown>;
          if (!field.label && field.type !== "hidden") {
            results.push({
              ruleId: "accessibility/form-labels",
              severity: "warning",
              message: `Form field "${field.name}" has no label`,
              path: `${path}.fields[${i}]`,
              suggestion: "Add a label for screen reader accessibility",
            });
          }
        }
      }
    });
    return results;
  },
};

export const navAria: AuditRule = {
  id: "accessibility/nav-aria",
  category: "accessibility",
  check(manifest) {
    if (!manifest.nav || manifest.nav.length === 0) return [];
    const hasLabels = manifest.nav.every((item) => item.label && item.label.length > 0);
    if (hasLabels) return [];
    return [
      {
        ruleId: "accessibility/nav-aria",
        severity: "warning",
        message: "Nav items should have descriptive labels for accessibility",
        path: "nav",
      },
    ];
  },
};

// ── UX rules ─────────────────────────────────────────────────────────────────

export const emptyState: AuditRule = {
  id: "ux/empty-state",
  category: "ux",
  check(manifest) {
    const results: AuditResult[] = [];
    walkAllComponents(manifest, (comp, path) => {
      if ((comp.type === "table" || comp.type === "feed") && !comp.emptyState) {
        results.push({
          ruleId: "ux/empty-state",
          severity: "info",
          message: `"${comp.type}" component has no emptyState message configured`,
          path,
          suggestion: "Add emptyState to improve UX when no data is available",
        });
      }
    });
    return results;
  },
};

export const confirmDestructive: AuditRule = {
  id: "ux/confirm-destructive",
  category: "ux",
  check(manifest) {
    const results: AuditResult[] = [];
    walkAllComponents(manifest, (comp, path) => {
      if (comp.type === "table" && comp.actions && Array.isArray(comp.actions)) {
        for (let i = 0; i < comp.actions.length; i++) {
          const action = comp.actions[i] as Record<string, unknown>;
          if (
            action.action === "api" &&
            (action.method === "DELETE" || action.variant === "destructive") &&
            action.action !== "confirm"
          ) {
            // Check if it's wrapped in a confirm
            const isConfirmWrapped =
              typeof action.onConfirm === "object" || action.action === "confirm";
            if (!isConfirmWrapped) {
              results.push({
                ruleId: "ux/confirm-destructive",
                severity: "warning",
                message: "Destructive action should be wrapped in a confirm dialog",
                path: `${path}.actions[${i}]`,
                suggestion:
                  'Wrap with { action: "confirm", message: "Are you sure?", onConfirm: ... }',
              });
            }
          }
        }
      }
    });
    return results;
  },
};

// ── Performance rules ────────────────────────────────────────────────────────

export const paginationRecommended: AuditRule = {
  id: "performance/pagination",
  category: "performance",
  check(manifest) {
    const results: AuditResult[] = [];
    walkAllComponents(manifest, (comp, path) => {
      if (comp.type === "table" && !comp.pagination) {
        results.push({
          ruleId: "performance/pagination",
          severity: "info",
          message:
            "Table has no pagination configured — large datasets may cause performance issues",
          path,
          suggestion: "Add pagination: { type: 'cursor', pageSize: 25 }",
        });
      }
    });
    return results;
  },
};

// ── Security rules ───────────────────────────────────────────────────────────

export const noSensitiveDisplay: AuditRule = {
  id: "security/no-sensitive-display",
  category: "security",
  check(manifest) {
    const sensitivePatterns = /password|secret|token|apiKey|private|ssn|creditCard/i;
    const results: AuditResult[] = [];
    walkAllComponents(manifest, (comp, path) => {
      if (comp.type === "detail" && comp.fields && Array.isArray(comp.fields)) {
        for (let i = 0; i < comp.fields.length; i++) {
          const field = comp.fields[i] as Record<string, unknown>;
          if (typeof field.field === "string" && sensitivePatterns.test(field.field)) {
            results.push({
              ruleId: "security/no-sensitive-display",
              severity: "warning",
              message: `Detail view displays field "${field.field}" which may contain sensitive data`,
              path: `${path}.fields[${i}]`,
              suggestion: "Consider hiding or masking this field",
            });
          }
        }
      }
    });
    return results;
  },
};

// ── Consistency rules ────────────────────────────────────────────────────────

export const themeCoverage: AuditRule = {
  id: "consistency/theme-coverage",
  category: "consistency",
  check(manifest) {
    if (!manifest.theme) {
      return [
        {
          ruleId: "consistency/theme-coverage",
          severity: "info",
          message: "No theme configured — using defaults",
          path: "theme",
          suggestion: "Add a theme section to customize the visual appearance",
        },
      ];
    }
    return [];
  },
};

// ── All built-in rules ───────────────────────────────────────────────────────

export const builtinAuditRules: AuditRule[] = [
  formLabels,
  navAria,
  emptyState,
  confirmDestructive,
  paginationRecommended,
  noSensitiveDisplay,
  themeCoverage,
];
