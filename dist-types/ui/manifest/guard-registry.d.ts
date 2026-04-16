import type { PolicyExpr } from "../policies/types";
import type { ComponentConfig, CompiledManifest, CompiledRoute, RouteGuard, RouteGuardConfig } from "./types";
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
/** Register a named route guard implementation for manifest resolution. */
export declare function registerGuard(name: string, def: GuardDef): void;
/** Resolve a previously registered route guard by name. */
export declare function resolveGuard(name: string): GuardDef | undefined;
/** List the names of all currently registered route guards. */
export declare function getRegisteredGuards(): string[];
export declare function registerBuiltInGuards(): void;
export declare function guardUsesAuthState(guard: RouteGuard | undefined): boolean;
export declare function evaluateManifestGuard(guard: RouteGuard | undefined, context: Omit<GuardContext, "guard">): GuardResult;
