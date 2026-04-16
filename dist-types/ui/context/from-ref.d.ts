import type { FromRef } from "./types";
/**
 * Reserved prefixes for `from` references.
 *
 * These prefixes are resolved against built-in sources (manifest config, route
 * params, overlay state, etc.) and take priority over workflow context keys.
 * Using one of these as a workflow `capture` / `assign` key prefix will cause
 * silent mis-resolution — the value will be read from the built-in source
 * instead of the workflow context.
 *
 * @see {@link resolveFromRef} for the resolution order.
 */
export declare const RESERVED_FROM_PREFIXES: readonly ["params.", "route.", "overlay.", "auth.", "app.", "global.", "state."];
export interface ResolveFromRefContext {
    context?: Record<string, unknown>;
    pageRegistry?: {
        get(id: string): unknown;
        store: {
            get(atom: unknown): unknown;
        };
    } | null;
    appRegistry?: {
        get(id: string): unknown;
        store: {
            get(atom: unknown): unknown;
        };
    } | null;
    route?: {
        id?: string;
        path?: string;
        pattern?: string;
        params?: Record<string, string>;
        query?: Record<string, string>;
    } | null;
    overlay?: {
        id?: string;
        kind?: string;
        payload?: unknown;
        result?: unknown;
    } | null;
    manifest?: {
        app?: Record<string, unknown>;
        auth?: Record<string, unknown>;
    } | null;
}
export declare function buildExpressionContext(context: ResolveFromRefContext): Record<string, unknown>;
export declare function resolveDynamicValue(value: unknown, context: ResolveFromRefContext): unknown;
export declare function resolveFromRef(ref: FromRef, { context, pageRegistry, appRegistry, route, overlay, manifest, }: ResolveFromRefContext): unknown;
