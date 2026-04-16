import { resolveFromRef } from "../context/from-ref";
import { evaluatePolicy } from "../policies/evaluate";
import type { PolicyExpr } from "../policies/types";
import type {
  ComponentConfig,
  CompiledManifest,
  CompiledRoute,
  RouteGuard,
  RouteGuardConfig,
} from "./types";
import { authenticatedGuard } from "./guards/authenticated";
import { permissionGuard } from "./guards/permission";
import { roleGuard } from "./guards/role";
import { unauthenticatedGuard } from "./guards/unauthenticated";

export interface GuardRouteContext {
  id?: string;
  path?: string;
  pattern?: string;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

export interface GuardResult {
  allow: boolean;
  redirect?: string;
  render?: ComponentConfig;
}

export interface GuardContext {
  manifest: CompiledManifest;
  route: CompiledRoute;
  guard: RouteGuardConfig;
  user: Record<string, unknown> | null;
  policies: Record<string, PolicyExpr>;
  parentPolicies?: Record<string, PolicyExpr>;
  routeContext?: GuardRouteContext;
}

export type GuardDef = (context: GuardContext) => GuardResult;

const guardRegistry = new Map<string, GuardDef>();

let builtInGuardsRegistered = false;

function devWarn(message: string): void {
  if (
    typeof process !== "undefined" &&
    process.env?.["NODE_ENV"] === "development"
  ) {
    console.warn(message);
  }
}

function normalizeGuardConfig(
  guard: RouteGuard | undefined,
): RouteGuardConfig | undefined {
  if (!guard) {
    return undefined;
  }

  if (typeof guard === "string") {
    return { name: guard };
  }

  return guard;
}

function applyFallbacks(
  result: GuardResult,
  guard: RouteGuardConfig,
): GuardResult {
  if (result.allow) {
    return result;
  }

  return {
    allow: false,
    ...(result.redirect
      ? { redirect: result.redirect }
      : guard.redirectTo
        ? { redirect: guard.redirectTo }
        : null),
    ...(result.render
      ? { render: result.render }
      : guard.render
        ? { render: guard.render as ComponentConfig }
        : null),
  };
}

function collectUserRoles(user: Record<string, unknown> | null): string[] {
  if (!user) {
    return [];
  }

  const roles = Array.isArray(user["roles"])
    ? user["roles"].map((value) => String(value))
    : [];
  if (typeof user["role"] === "string") {
    roles.push(String(user["role"]));
  }

  return [...new Set(roles)];
}

function evaluateInlineGuard(context: GuardContext): GuardResult {
  const {
    guard,
    manifest,
    parentPolicies,
    policies,
    route: _route,
    routeContext,
    user,
  } = context;

  if (guard.authenticated === true && !user) {
    return applyFallbacks({ allow: false }, guard);
  }

  if (guard.authenticated === false && user) {
    return applyFallbacks({ allow: false }, guard);
  }

  if (guard.roles?.length) {
    const userRoles = collectUserRoles(user);
    if (!guard.roles.some((role) => userRoles.includes(role))) {
      return applyFallbacks({ allow: false }, guard);
    }
  }

  if (guard.policy) {
    const expression = policies[guard.policy] ?? parentPolicies?.[guard.policy];
    const allowed = evaluatePolicy(guard.policy, expression, {
      policies,
      parentPolicies,
      resolveFromRef: (ref) =>
        resolveFromRef(ref, {
          context: {
            global: {
              user,
              auth: {
                user,
                isAuthenticated: Boolean(user),
              },
            },
          },
          route: routeContext,
          manifest: {
            app: manifest.app as Record<string, unknown>,
            auth: (manifest.auth ?? {}) as Record<string, unknown>,
          },
        }),
    });
    if (!allowed) {
      return applyFallbacks({ allow: false }, guard);
    }
  }

  return { allow: true };
}

/** Register a named route guard implementation for manifest resolution. */
export function registerGuard(name: string, def: GuardDef): void {
  guardRegistry.set(name, def);
}

/** Resolve a previously registered route guard by name. */
export function resolveGuard(name: string): GuardDef | undefined {
  return guardRegistry.get(name);
}

/** List the names of all currently registered route guards. */
export function getRegisteredGuards(): string[] {
  return [...guardRegistry.keys()];
}

export function registerBuiltInGuards(): void {
  if (builtInGuardsRegistered) {
    return;
  }

  builtInGuardsRegistered = true;
  registerGuard("authenticated", authenticatedGuard);
  registerGuard("role", roleGuard);
  registerGuard("permission", permissionGuard);
  registerGuard("unauthenticated", unauthenticatedGuard);
}

export function guardUsesAuthState(guard: RouteGuard | undefined): boolean {
  const config = normalizeGuardConfig(guard);
  if (!config) {
    return false;
  }

  if (
    config.authenticated !== undefined ||
    Boolean(config.roles?.length) ||
    Boolean(config.policy)
  ) {
    return true;
  }

  return ["authenticated", "unauthenticated", "role", "permission"].includes(
    config.name ?? "",
  );
}

export function evaluateManifestGuard(
  guard: RouteGuard | undefined,
  context: Omit<GuardContext, "guard">,
): GuardResult {
  const normalized = normalizeGuardConfig(guard);
  if (!normalized) {
    return { allow: true };
  }

  if (normalized.name) {
    const registered = resolveGuard(normalized.name);
    if (!registered) {
      devWarn(`[snapshot] Unknown route guard "${normalized.name}"`);
      return applyFallbacks({ allow: false }, normalized);
    }

    const registeredResult = applyFallbacks(
      registered({
        ...context,
        guard: normalized,
      }),
      normalized,
    );
    if (!registeredResult.allow) {
      return registeredResult;
    }
  }

  if (
    normalized.authenticated !== undefined ||
    Boolean(normalized.roles?.length) ||
    Boolean(normalized.policy)
  ) {
    return evaluateInlineGuard({
      ...context,
      guard: normalized,
    });
  }

  return { allow: true };
}
