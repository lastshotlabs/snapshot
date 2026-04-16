import { type ReactNode } from "react";
import type { ApiClientLike } from "../../api/client";
import { type EndpointTarget } from "./resources";
import type { CompiledManifest, CompiledRoute, RouteMatch } from "./types";
/**
 * Compiled manifest runtime context for config-driven apps.
 */
export declare const ManifestRuntimeContext: import("react").Context<CompiledManifest | null>;
/**
 * Cached manifest resource entry stored by the manifest runtime.
 */
export interface ResourceCacheEntry {
    status: "loading" | "ready" | "error";
    data?: unknown;
    error?: Error;
    updatedAt?: number;
    resourceName?: string;
    /** Stable query key tuple for explicit key invalidation. */
    queryKey?: string[];
}
interface ManifestResourceCacheValue {
    entries: Record<string, ResourceCacheEntry>;
    getResourceVersion: (name: string) => number;
    getInvalidationTargets: (name: string) => string[];
    getCacheKey: (target: EndpointTarget, params?: Record<string, unknown>) => string | null;
    getEntry: (target: EndpointTarget, params?: Record<string, unknown>) => ResourceCacheEntry | undefined;
    getData: (target: EndpointTarget, params?: Record<string, unknown>) => unknown;
    loadTarget: (target: EndpointTarget, params?: Record<string, unknown>, options?: {
        signal?: AbortSignal;
    }) => Promise<unknown>;
    preloadResource: (name: string, params?: Record<string, unknown>, options?: {
        signal?: AbortSignal;
    }) => Promise<unknown>;
    invalidateResource: (name: string) => void;
    invalidateQueryKey: (queryKey: string[]) => void;
    mutateTarget: (target: EndpointTarget, options?: {
        method?: "POST" | "PUT" | "PATCH" | "DELETE";
        params?: Record<string, unknown>;
        pathParams?: Record<string, unknown>;
        payload?: Record<string, unknown>;
    }) => Promise<unknown>;
}
interface RouteRuntimeValue {
    currentPath: string;
    currentRoute: CompiledRoute | null;
    match: RouteMatch;
    params: Record<string, string>;
    query: Record<string, string>;
    navigate: (to: string, options?: {
        replace?: boolean;
    }) => void;
    isPreloading: boolean;
}
interface OverlayRuntimeValue {
    id: string;
    kind: "modal" | "drawer";
    payload: unknown;
    result?: unknown;
}
/**
 * Runtime context exposed to components rendered inside modal and drawer
 * overlays so they can access the active overlay id and payload.
 */
export declare const OverlayRuntimeContext: import("react").Context<OverlayRuntimeValue | null>;
/**
 * Provides manifest runtime state, resource cache state, and mutation helpers.
 *
 * @param props - Provider props containing compiled manifest and API clients
 */
export declare function ManifestRuntimeProvider({ manifest, api, clients, children, }: {
    manifest: CompiledManifest;
    api?: ApiClientLike;
    clients?: Record<string, ApiClientLike>;
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
/**
 * Provide route runtime state to manifest-rendered components.
 */
export declare function RouteRuntimeProvider({ value, children, }: {
    value: RouteRuntimeValue;
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
/**
 * Provide the current overlay runtime payload and metadata.
 */
export declare function OverlayRuntimeProvider({ value, children, }: {
    value: OverlayRuntimeValue;
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
/**
 * Access the compiled manifest runtime.
 */
export declare function useManifestRuntime(): CompiledManifest | null;
/**
 * Access the manifest resource cache runtime for loads, invalidation, and
 * resource-driven mutations.
 */
export declare function useManifestResourceCache(): ManifestResourceCacheValue | null;
/**
 * Access the current route runtime state.
 */
export declare function useRouteRuntime(): RouteRuntimeValue | null;
/**
 * Access the current overlay runtime state.
 */
export declare function useOverlayRuntime(): OverlayRuntimeValue | null;
/**
 * Invalidate a manifest resource on an interval when polling is enabled.
 */
export declare function useManifestResourcePolling(resourceName?: string, enabled?: boolean): void;
/**
 * Invalidate a manifest resource when the window regains focus.
 */
export declare function useManifestResourceFocusRefetch(resourceName?: string, enabled?: boolean): void;
/**
 * Invalidate a manifest resource on mount when the resource opts into it.
 */
export declare function useManifestResourceMountRefetch(resourceName?: string, enabled?: boolean): void;
export {};
