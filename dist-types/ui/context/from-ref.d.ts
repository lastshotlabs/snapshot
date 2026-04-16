import type { FromRef } from "./types";
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
