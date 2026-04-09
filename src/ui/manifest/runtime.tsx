import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ApiClient } from "../../api/client";
import {
  buildRequestUrl,
  isResourceRef,
  resolveEndpointTarget,
  type EndpointTarget,
} from "./resources";
import type { CompiledManifest, CompiledRoute } from "./types";

export const ManifestRuntimeContext = createContext<CompiledManifest | null>(
  null,
);

export interface ResourceCacheEntry {
  status: "loading" | "ready" | "error";
  data?: unknown;
  error?: Error;
  updatedAt?: number;
  resourceName?: string;
}

interface ManifestResourceCacheValue {
  entries: Record<string, ResourceCacheEntry>;
  getResourceVersion: (name: string) => number;
  getCacheKey: (
    target: EndpointTarget,
    params?: Record<string, unknown>,
  ) => string | null;
  getEntry: (
    target: EndpointTarget,
    params?: Record<string, unknown>,
  ) => ResourceCacheEntry | undefined;
  getData: (target: EndpointTarget, params?: Record<string, unknown>) => unknown;
  loadTarget: (
    target: EndpointTarget,
    params?: Record<string, unknown>,
  ) => Promise<unknown>;
  preloadResource: (
    name: string,
    params?: Record<string, unknown>,
  ) => Promise<unknown>;
  invalidateResource: (name: string) => void;
}

interface RouteRuntimeValue {
  currentPath: string;
  currentRoute: CompiledRoute | null;
  params: Record<string, string>;
  navigate: (to: string, options?: { replace?: boolean }) => void;
  isPreloading: boolean;
}

interface OverlayRuntimeValue {
  id: string;
  kind: "modal" | "drawer";
  payload: unknown;
}

const ManifestResourceCacheContext =
  createContext<ManifestResourceCacheValue | null>(null);
const RouteRuntimeContext = createContext<RouteRuntimeValue | null>(null);
export const OverlayRuntimeContext =
  createContext<OverlayRuntimeValue | null>(null);

export function ManifestRuntimeProvider({
  manifest,
  api,
  children,
}: {
  manifest: CompiledManifest;
  api?: ApiClient;
  children: ReactNode;
}) {
  const [entries, setEntries] = useState<Record<string, ResourceCacheEntry>>({});
  const [resourceVersions, setResourceVersions] = useState<Record<string, number>>({});

  const isEntryFresh = useCallback(
    (entry: ResourceCacheEntry | undefined) => {
      if (!entry || entry.status !== "ready") {
        return false;
      }

      if (!entry.resourceName) {
        return true;
      }

      const cacheMs = manifest.resources?.[entry.resourceName]?.cacheMs;
      if (cacheMs === undefined) {
        return true;
      }

      if (cacheMs === 0) {
        return false;
      }

      return (
        entry.updatedAt !== undefined && Date.now() - entry.updatedAt <= cacheMs
      );
    },
    [manifest.resources],
  );

  const getCacheKey = useCallback(
    (target: EndpointTarget, params: Record<string, unknown> = {}) => {
      try {
        const request = resolveEndpointTarget(target, manifest.resources, params);
        const url = buildRequestUrl(request.endpoint, request.params);
        return `${request.method} ${url}`;
      } catch {
        return null;
      }
    },
    [manifest.resources],
  );

  const loadTarget = useCallback(
    async (target: EndpointTarget, params: Record<string, unknown> = {}) => {
      if (!api) {
        throw new Error(
          "ManifestRuntimeProvider requires an API client for resource loading.",
        );
      }

      const request = resolveEndpointTarget(target, manifest.resources, params);
      const url = buildRequestUrl(request.endpoint, request.params);
      const key = `${request.method} ${url}`;
      const existing = entries[key];
      if (isEntryFresh(existing)) {
        return existing!.data;
      }

      setEntries((current) => ({
        ...current,
        [key]: {
          status: "loading",
          data: current[key]?.data,
          resourceName: isResourceRef(target) ? target.resource : current[key]?.resourceName,
        },
      }));

      try {
        let data: unknown;
        switch (request.method) {
          case "POST":
            data = await api.post(url, undefined);
            break;
          case "PUT":
            data = await api.put(url, undefined);
            break;
          case "PATCH":
            data = await api.patch(url, undefined);
            break;
          case "DELETE":
            data = await api.delete(url);
            break;
          default:
            data = await api.get(url);
        }

        setEntries((current) => ({
          ...current,
          [key]: {
            status: "ready",
            data,
            updatedAt: Date.now(),
            resourceName: isResourceRef(target) ? target.resource : undefined,
          },
        }));

        return data;
      } catch (error) {
        const resolvedError =
          error instanceof Error ? error : new Error("Failed to load resource");
        setEntries((current) => ({
          ...current,
          [key]: {
            status: "error",
            error: resolvedError,
            resourceName: isResourceRef(target) ? target.resource : current[key]?.resourceName,
          },
        }));
        throw resolvedError;
      }
    },
    [api, entries, isEntryFresh, manifest.resources],
  );

  const cacheValue = useMemo<ManifestResourceCacheValue>(
    () => ({
      entries,
      getResourceVersion: (name) => resourceVersions[name] ?? 0,
      getCacheKey,
      getEntry: (target, params) => {
        const key = getCacheKey(target, params);
        return key ? entries[key] : undefined;
      },
      getData: (target, params) => {
        const key = getCacheKey(target, params);
        const entry = key ? entries[key] : undefined;
        return isEntryFresh(entry) ? entry?.data : undefined;
      },
      loadTarget,
      preloadResource: (name, params) => loadTarget({ resource: name }, params),
      invalidateResource: (name) => {
        setEntries((current) =>
          Object.fromEntries(
            Object.entries(current).filter(
              ([, entry]) => entry.resourceName !== name,
            ),
          ),
        );
        setResourceVersions((current) => ({
          ...current,
          [name]: (current[name] ?? 0) + 1,
        }));
      },
    }),
    [entries, getCacheKey, isEntryFresh, loadTarget, resourceVersions],
  );

  return (
    <ManifestRuntimeContext.Provider value={manifest}>
      <ManifestResourceCacheContext.Provider value={cacheValue}>
        {children}
      </ManifestResourceCacheContext.Provider>
    </ManifestRuntimeContext.Provider>
  );
}

export function RouteRuntimeProvider({
  value,
  children,
}: {
  value: RouteRuntimeValue;
  children: ReactNode;
}) {
  return (
    <RouteRuntimeContext.Provider value={value}>
      {children}
    </RouteRuntimeContext.Provider>
  );
}

export function OverlayRuntimeProvider({
  value,
  children,
}: {
  value: OverlayRuntimeValue;
  children: ReactNode;
}) {
  return (
    <OverlayRuntimeContext.Provider value={value}>
      {children}
    </OverlayRuntimeContext.Provider>
  );
}

export function useManifestRuntime(): CompiledManifest | null {
  return useContext(ManifestRuntimeContext);
}

export function useManifestResourceCache(): ManifestResourceCacheValue | null {
  return useContext(ManifestResourceCacheContext);
}

export function useRouteRuntime(): RouteRuntimeValue | null {
  return useContext(RouteRuntimeContext);
}

export function useOverlayRuntime(): OverlayRuntimeValue | null {
  return useContext(OverlayRuntimeContext);
}
