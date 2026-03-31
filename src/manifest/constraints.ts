import type { ComponentConfig, FrontendManifest } from "./schema";
import { walkComponents } from "./walk";

// ── Types ────────────────────────────────────────────────────────────────────

export type ConstraintSeverity = "error" | "warning";

export interface ConstraintViolation {
  ruleId: string;
  severity: ConstraintSeverity;
  message: string;
  path?: string;
}

export interface ConstraintResult {
  valid: boolean;
  errors: ConstraintViolation[];
  warnings: ConstraintViolation[];
}

export interface ConstraintRule {
  id: string;
  severity: ConstraintSeverity;
  check(manifest: FrontendManifest): ConstraintViolation[];
}

// ── Engine ───────────────────────────────────────────────────────────────────

export interface ConstraintEngine {
  addRule(rule: ConstraintRule): void;
  removeRule(id: string): void;
  check(manifest: FrontendManifest): ConstraintResult;
}

export function createConstraintEngine(rules?: ConstraintRule[]): ConstraintEngine {
  const ruleMap = new Map<string, ConstraintRule>();

  if (rules) {
    for (const rule of rules) ruleMap.set(rule.id, rule);
  }

  return {
    addRule(rule) {
      ruleMap.set(rule.id, rule);
    },

    removeRule(id) {
      ruleMap.delete(id);
    },

    check(manifest) {
      const errors: ConstraintViolation[] = [];
      const warnings: ConstraintViolation[] = [];

      for (const rule of ruleMap.values()) {
        const violations = rule.check(manifest);
        for (const v of violations) {
          if (v.severity === "error") {
            errors.push(v);
          } else {
            warnings.push(v);
          }
        }
      }

      return { valid: errors.length === 0, errors, warnings };
    },
  };
}

// ── Built-in rules ───────────────────────────────────────────────────────────

const DATA_BOUND_TYPES = new Set(["table", "detail", "stat-card", "feed", "chart"]);

const LAYOUT_TYPES = new Set(["row", "stack", "card", "sidebar-layout"]);

export const dataSourceRequired: ConstraintRule = {
  id: "data-source-required",
  severity: "error",
  check(manifest) {
    const violations: ConstraintViolation[] = [];
    for (const [pagePath, page] of Object.entries(manifest.pages)) {
      walkComponents(page.components, `pages.${pagePath}`, (comp, path) => {
        if (DATA_BOUND_TYPES.has(comp.type) && !comp.data) {
          violations.push({
            ruleId: "data-source-required",
            severity: "error",
            message: `Component "${comp.type}" requires a "data" field`,
            path,
          });
        }
      });
    }
    return violations;
  },
};

export const formEndpointRequired: ConstraintRule = {
  id: "form-endpoint-required",
  severity: "error",
  check(manifest) {
    const violations: ConstraintViolation[] = [];
    for (const [pagePath, page] of Object.entries(manifest.pages)) {
      walkComponents(page.components, `pages.${pagePath}`, (comp, path) => {
        if (comp.type === "form" && !comp.data) {
          violations.push({
            ruleId: "form-endpoint-required",
            severity: "error",
            message: 'Form component requires a "data" field pointing to a mutation endpoint',
            path,
          });
        }
      });
    }
    return violations;
  },
};

export const navPathExists: ConstraintRule = {
  id: "nav-path-exists",
  severity: "warning",
  check(manifest) {
    if (!manifest.nav) return [];
    const pageKeys = new Set(Object.keys(manifest.pages));
    const violations: ConstraintViolation[] = [];

    function checkNavItems(
      items: { path: string; children?: { path: string }[] }[],
      prefix: string,
    ) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]!;
        if (!pageKeys.has(item.path)) {
          violations.push({
            ruleId: "nav-path-exists",
            severity: "warning",
            message: `Nav item path "${item.path}" does not match any defined page`,
            path: `${prefix}[${i}]`,
          });
        }
        if (item.children) {
          checkNavItems(item.children, `${prefix}[${i}].children`);
        }
      }
    }

    checkNavItems(manifest.nav, "nav");
    return violations;
  },
};

export const componentIdUnique: ConstraintRule = {
  id: "component-id-unique",
  severity: "error",
  check(manifest) {
    const violations: ConstraintViolation[] = [];
    for (const [pagePath, page] of Object.entries(manifest.pages)) {
      const ids = new Map<string, string>();
      walkComponents(page.components, `pages.${pagePath}`, (comp, path) => {
        if (comp.id) {
          if (ids.has(comp.id)) {
            violations.push({
              ruleId: "component-id-unique",
              severity: "error",
              message: `Duplicate component ID "${comp.id}" — also at ${ids.get(comp.id)}`,
              path,
            });
          } else {
            ids.set(comp.id, path);
          }
        }
      });
    }
    return violations;
  },
};

export const fromRefExists: ConstraintRule = {
  id: "from-ref-exists",
  severity: "error",
  check(manifest) {
    const violations: ConstraintViolation[] = [];
    for (const [pagePath, page] of Object.entries(manifest.pages)) {
      const ids = new Set<string>();
      walkComponents(page.components, `pages.${pagePath}`, (comp) => {
        if (comp.id) ids.add(comp.id);
      });

      walkComponents(page.components, `pages.${pagePath}`, (comp, path) => {
        if (comp.data && typeof comp.data === "object" && "params" in comp.data) {
          const params = (comp.data as { params?: Record<string, unknown> }).params;
          if (params) {
            for (const [key, value] of Object.entries(params)) {
              if (typeof value === "object" && value !== null && "from" in value) {
                const fromId = (value as { from: string }).from;
                if (!ids.has(fromId)) {
                  violations.push({
                    ruleId: "from-ref-exists",
                    severity: "error",
                    message: `Parameter "${key}" references component "${fromId}" which does not exist on this page`,
                    path: `${path}.data.params.${key}`,
                  });
                }
              }
            }
          }
        }
      });
    }
    return violations;
  },
};

export const layoutChildrenRequired: ConstraintRule = {
  id: "layout-children-required",
  severity: "error",
  check(manifest) {
    const violations: ConstraintViolation[] = [];
    for (const [pagePath, page] of Object.entries(manifest.pages)) {
      walkComponents(page.components, `pages.${pagePath}`, (comp, path) => {
        if (LAYOUT_TYPES.has(comp.type) && comp.type !== "sidebar-layout") {
          if (!comp.children || !Array.isArray(comp.children) || comp.children.length === 0) {
            violations.push({
              ruleId: "layout-children-required",
              severity: "error",
              message: `Layout component "${comp.type}" must have a non-empty "children" array`,
              path,
            });
          }
        }
        if (comp.type === "sidebar-layout") {
          if (!comp.sidebar || !Array.isArray(comp.sidebar) || comp.sidebar.length === 0) {
            violations.push({
              ruleId: "layout-children-required",
              severity: "error",
              message: '"sidebar-layout" must have a non-empty "sidebar" array',
              path,
            });
          }
          if (!comp.content || !Array.isArray(comp.content) || comp.content.length === 0) {
            violations.push({
              ruleId: "layout-children-required",
              severity: "error",
              message: '"sidebar-layout" must have a non-empty "content" array',
              path,
            });
          }
        }
      });
    }
    return violations;
  },
};

export const modalIdRequired: ConstraintRule = {
  id: "modal-id-required",
  severity: "error",
  check(manifest) {
    const violations: ConstraintViolation[] = [];
    for (const [pagePath, page] of Object.entries(manifest.pages)) {
      walkComponents(page.components, `pages.${pagePath}`, (comp, path) => {
        if (comp.type === "modal" && !comp.id) {
          violations.push({
            ruleId: "modal-id-required",
            severity: "error",
            message: "Modal component must have an id (used by open-modal/close-modal actions)",
            path,
          });
        }
      });
    }
    return violations;
  },
};

export const authScreensValid: ConstraintRule = {
  id: "auth-screens-valid",
  severity: "error",
  check(manifest) {
    if (!manifest.auth) return [];
    const validScreens = new Set([
      "login",
      "register",
      "forgot-password",
      "reset-password",
      "verify-email",
      "mfa",
      "mfa-setup",
      "passkey-login",
    ]);
    const violations: ConstraintViolation[] = [];
    for (let i = 0; i < manifest.auth.screens.length; i++) {
      const screen = manifest.auth.screens[i]!;
      if (!validScreens.has(screen)) {
        violations.push({
          ruleId: "auth-screens-valid",
          severity: "error",
          message: `Unknown auth screen: "${screen}"`,
          path: `auth.screens[${i}]`,
        });
      }
    }
    return violations;
  },
};

// ── Default engine ───────────────────────────────────────────────────────────

/**
 * Creates a constraint engine pre-loaded with all built-in rules.
 */
export function createDefaultConstraintEngine(): ConstraintEngine {
  return createConstraintEngine([
    dataSourceRequired,
    formEndpointRequired,
    navPathExists,
    componentIdUnique,
    fromRefExists,
    layoutChildrenRequired,
    modalIdRequired,
    authScreensValid,
  ]);
}
