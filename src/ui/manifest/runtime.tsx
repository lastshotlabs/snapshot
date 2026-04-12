import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ApiClientLike } from "../../api/client";
import {
  buildRequestUrl,
  collectDependentResources,
  getResourceInvalidationTargets,
  isOptimisticResourceTarget,
  isQueryKeyInvalidationTarget,
  isResourceRef,
  resolveEndpointTarget,
  type EndpointTarget,
  type OptimisticConfig,
  type OptimisticTarget,
  type ResourceInvalidationTarget,
  type ResourceMap,
} from "./resources";
import type { CompiledManifest, CompiledRoute, RouteMatch } from "./types";

export const ManifestRuntimeContext = createContext<CompiledManifest | null>(
  null,
);

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
  getCacheKey: (
    target: EndpointTarget,
    params?: Record<string, unknown>,
  ) => string | null;
  getEntry: (
    target: EndpointTarget,
    params?: Record<string, unknown>,
  ) => ResourceCacheEntry | undefined;
  getData: (
    target: EndpointTarget,
    params?: Record<string, unknown>,
  ) => unknown;
  loadTarget: (
    target: EndpointTarget,
    params?: Record<string, unknown>,
    options?: { signal?: AbortSignal },
  ) => Promise<unknown>;
  preloadResource: (
    name: string,
    params?: Record<string, unknown>,
    options?: { signal?: AbortSignal },
  ) => Promise<unknown>;
  invalidateResource: (name: string) => void;
  invalidateQueryKey: (queryKey: string[]) => void;
  mutateTarget: (
    target: EndpointTarget,
    options?: {
      method?: "POST" | "PUT" | "PATCH" | "DELETE";
      params?: Record<string, unknown>;
      pathParams?: Record<string, unknown>;
      payload?: Record<string, unknown>;
    },
  ) => Promise<unknown>;
}

interface RouteRuntimeValue {
  currentPath: string;
  currentRoute: CompiledRoute | null;
  match: RouteMatch;
  params: Record<string, string>;
  query: Record<string, string>;
  navigate: (to: string, options?: { replace?: boolean }) => void;
  isPreloading: boolean;
}

interface OverlayRuntimeValue {
  id: string;
  kind: "modal" | "drawer";
  payload: unknown;
  result?: unknown;
}

const ManifestResourceCacheContext =
  createContext<ManifestResourceCacheValue | null>(null);
const RouteRuntimeContext = createContext<RouteRuntimeValue | null>(null);
export const OverlayRuntimeContext = createContext<OverlayRuntimeValue | null>(
  null,
);

function toQueryKey(client: string, method: string, url: string): string[] {
  return [client, method, url];
}

function toCacheKey(queryKey: string[]): string {
  return JSON.stringify(queryKey);
}

function parseCacheKey(cacheKey: string): string[] {
  try {
    const parsed = JSON.parse(cacheKey);
    if (Array.isArray(parsed) && parsed.every((segment) => typeof segment === "string")) {
      return parsed;
    }
  } catch {
    // Fall through to legacy cache-key parser.
  }

  const separator = cacheKey.indexOf(" ");
  if (separator === -1) {
    return [cacheKey];
  }

  return [cacheKey.slice(0, separator), cacheKey.slice(separator + 1)];
}

function hasSameQueryKey(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((segment, index) => right[index] === segment);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function devWarn(message: string): void {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
    return;
  }

  // eslint-disable-next-line no-console
  console.warn(message);
}

function resolveTargetQueryKey(
  target: OptimisticTarget,
  resources?: ResourceMap,
): string[] | null {
  const targetRef = isOptimisticResourceTarget(target)
    ? target
    : { resource: target };

  try {
    const request = resolveEndpointTarget(
      { resource: targetRef.resource, params: targetRef.params },
      resources,
      targetRef.params,
    );
    const url = buildRequestUrl(request.endpoint, request.params);
    return toQueryKey(request.client, request.method, url);
  } catch {
    return null;
  }
}

function applyOptimisticMerge(
  previous: unknown,
  payload: Record<string, unknown>,
  optimistic: OptimisticConfig,
): {
  applied: boolean;
  next: unknown;
} {
  const merge = optimistic.merge;

  if (merge === "append") {
    if (!Array.isArray(previous)) {
      devWarn(
        'snapshot: optimistic merge "append" requires a list target. Skipping optimistic update.',
      );
      return { applied: false, next: previous };
    }
    return { applied: true, next: [...previous, payload] };
  }

  if (merge === "prepend") {
    if (!Array.isArray(previous)) {
      devWarn(
        'snapshot: optimistic merge "prepend" requires a list target. Skipping optimistic update.',
      );
      return { applied: false, next: previous };
    }
    return { applied: true, next: [payload, ...previous] };
  }

  if (merge === "replace") {
    if (Array.isArray(previous)) {
      if (!optimistic.idField) {
        return { applied: false, next: previous };
      }

      const payloadId = payload[optimistic.idField];
      return {
        applied: true,
        next: previous.map((item) => {
          if (!isRecord(item)) {
            return item;
          }
          return item[optimistic.idField!] === payloadId ? payload : item;
        }),
      };
    }

    if (!isRecord(previous)) {
      devWarn(
        'snapshot: optimistic merge "replace" requires a list or object target. Skipping optimistic update.',
      );
      return { applied: false, next: previous };
    }

    return { applied: true, next: payload };
  }

  if (merge === "patch") {
    if (Array.isArray(previous)) {
      if (!optimistic.idField) {
        return { applied: false, next: previous };
      }

      const payloadId = payload[optimistic.idField];
      return {
        applied: true,
        next: previous.map((item) => {
          if (!isRecord(item) || item[optimistic.idField!] !== payloadId) {
            return item;
          }
          return { ...item, ...payload };
        }),
      };
    }

    if (!isRecord(previous)) {
      devWarn(
        'snapshot: optimistic merge "patch" requires a list or object target. Skipping optimistic update.',
      );
      return { applied: false, next: previous };
    }

    return { applied: true, next: { ...previous, ...payload } };
  }

  if (merge === "remove") {
    if (Array.isArray(previous)) {
      if (!optimistic.idField) {
        return { applied: false, next: previous };
      }

      const payloadId = payload[optimistic.idField];
      return {
        applied: true,
        next: previous.filter(
          (item) =>
            !isRecord(item) || item[optimistic.idField!] !== payloadId,
        ),
      };
    }

    if (!isRecord(previous)) {
      devWarn(
        'snapshot: optimistic merge "remove" requires a list or object target. Skipping optimistic update.',
      );
      return { applied: false, next: previous };
    }

    return { applied: true, next: null };
  }

  return { applied: false, next: previous };
}

/**
 * Provides manifest runtime state, resource cache state, and mutation helpers.
 *
 * @param props - Provider props containing compiled manifest and API clients
 */
export function ManifestRuntimeProvider({
  manifest,
  api,
  clients,
  children,
}: {
  manifest: CompiledManifest;
  api?: ApiClientLike;
  clients?: Record<string, ApiClientLike>;
  children: ReactNode;
}) {
  const [entries, setEntries] = useState<Record<string, ResourceCacheEntry>>(
    {},
  );
  const [resourceVersions, setResourceVersions] = useState<
    Record<string, number>
  >({});
  const resourceVersionsRef = useRef(resourceVersions);
  resourceVersionsRef.current = resourceVersions;
  const entriesRef = useRef(entries);
  const mutationChainsRef = useRef(new Map<string, Promise<unknown>>());
  const resolvedClients = useMemo(() => {
    const next = { ...(clients ?? {}) };
    if (api && !next["main"]) {
      next["main"] = api;
    }
    return next;
  }, [api, clients]);

  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

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
        return toCacheKey(toQueryKey(request.client, request.method, url));
      } catch {
        return null;
      }
    },
    [manifest.resources],
  );

  const loadTarget = useCallback(
    async (target: EndpointTarget, params: Record<string, unknown> = {}, options?: { signal?: AbortSignal }) => {
      if (!resolvedClients["main"]) {
        throw new Error(
          "ManifestRuntimeProvider requires an API client for resource loading.",
        );
      }

      const request = resolveEndpointTarget(target, manifest.resources, params);
      const selectedClient = resolvedClients[request.client];
      if (!selectedClient) {
        throw new Error(
          `Resource target requires manifest client "${request.client}", but no runtime client was provided.`,
        );
      }
      const url = buildRequestUrl(request.endpoint, request.params);
      const queryKey = toQueryKey(request.client, request.method, url);
      const key = toCacheKey(queryKey);
      const resourceConfig = isResourceRef(target)
        ? manifest.resources?.[target.resource]
        : undefined;
      const existing = entriesRef.current[key];
      if (isEntryFresh(existing)) {
        return existing!.data;
      }

      setEntries((current) => ({
        ...current,
        [key]: {
          status: "loading",
          data: current[key]?.data,
          resourceName: isResourceRef(target)
            ? target.resource
            : current[key]?.resourceName,
          queryKey,
        },
      }));

      try {
        const maxAttempts = (resourceConfig?.retry ?? 0) + 1;
        const retryDelayMs = resourceConfig?.retryDelayMs ?? 250;
        let data: unknown;
        let lastError: unknown;

        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
          try {
            const reqOptions = options?.signal ? { signal: options.signal } : undefined;
            switch (request.method) {
              case "POST":
                data = reqOptions ? await selectedClient.post(url, undefined, reqOptions) : await selectedClient.post(url, undefined);
                break;
              case "PUT":
                data = reqOptions ? await selectedClient.put(url, undefined, reqOptions) : await selectedClient.put(url, undefined);
                break;
              case "PATCH":
                data = reqOptions ? await selectedClient.patch(url, undefined, reqOptions) : await selectedClient.patch(url, undefined);
                break;
              case "DELETE":
                data = reqOptions ? await selectedClient.delete(url, undefined, reqOptions) : await selectedClient.delete(url);
                break;
              default:
                data = reqOptions ? await selectedClient.get(url, reqOptions) : await selectedClient.get(url);
            }
            lastError = undefined;
            break;
          } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") {
              throw error;
            }
            lastError = error;
            if (attempt >= maxAttempts - 1) {
              throw error;
            }
            await new Promise((resolve) => {
              setTimeout(resolve, retryDelayMs);
            });
          }
        }

        if (lastError !== undefined) {
          throw lastError;
        }

        setEntries((current) => ({
          ...current,
          [key]: {
            status: "ready",
            data,
            updatedAt: Date.now(),
            resourceName: isResourceRef(target) ? target.resource : undefined,
            queryKey,
          },
        }));

        return data;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          throw error;
        }
        const resolvedError =
          error instanceof Error ? error : new Error("Failed to load resource");
        setEntries((current) => ({
          ...current,
          [key]: {
            status: "error",
            error: resolvedError,
            resourceName: isResourceRef(target)
              ? target.resource
              : current[key]?.resourceName,
            queryKey: current[key]?.queryKey ?? queryKey,
          },
        }));
        throw resolvedError;
      }
    },
    [isEntryFresh, manifest.resources, resolvedClients],
  );

  const invalidateQueryKey = useCallback((queryKey: string[]) => {
    setEntries((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([cacheKey, entry]) => {
          const entryQueryKey = entry.queryKey ?? parseCacheKey(cacheKey);
          return !hasSameQueryKey(entryQueryKey, queryKey);
        }),
      ),
    );
  }, []);

  const invalidateResource = useCallback(
    (name: string) => {
      const names = [name, ...collectDependentResources(name, manifest.resources)];
      const nameSet = new Set(names);
      setEntries((current) =>
        Object.fromEntries(
          Object.entries(current).filter(
            ([, entry]) => !entry.resourceName || !nameSet.has(entry.resourceName),
          ),
        ),
      );
      setResourceVersions((current) => {
        const next = { ...current };
        for (const target of names) {
          next[target] = (next[target] ?? 0) + 1;
        }
        return next;
      });
    },
    [manifest.resources],
  );

  const applyInvalidationTargets = useCallback(
    (targets: ResourceInvalidationTarget[] | undefined) => {
      for (const target of targets ?? []) {
        if (isQueryKeyInvalidationTarget(target)) {
          invalidateQueryKey(target.key);
          continue;
        }

        invalidateResource(target);
      }
    },
    [invalidateQueryKey, invalidateResource],
  );

  const sendMutationRequest = useCallback(
    async (
      clientName: string,
      method: "POST" | "PUT" | "PATCH" | "DELETE",
      endpoint: string,
      payload?: Record<string, unknown>,
    ): Promise<unknown> => {
      const selectedClient = resolvedClients[clientName];
      if (!selectedClient) {
        throw new Error(
          `Resource mutation requires manifest client "${clientName}", but no runtime client was provided.`,
        );
      }

      switch (method) {
        case "PUT":
          return selectedClient.put(endpoint, payload);
        case "PATCH":
          return selectedClient.patch(endpoint, payload);
        case "DELETE":
          return selectedClient.delete(endpoint, payload);
        default:
          return selectedClient.post(endpoint, payload);
      }
    },
    [resolvedClients],
  );

  const mutateTarget = useCallback(
    async (
      target: EndpointTarget,
      options?: {
        method?: "POST" | "PUT" | "PATCH" | "DELETE";
        params?: Record<string, unknown>;
        pathParams?: Record<string, unknown>;
        payload?: Record<string, unknown>;
      },
    ): Promise<unknown> => {
      const fallbackMethod = options?.method ?? "POST";
      const payload = options?.payload;
      const params = options?.params ?? {};
      const pathParams = options?.pathParams ?? params;

      const request = resolveEndpointTarget(
        target,
        manifest.resources,
        params,
        fallbackMethod,
      );
      const endpoint = buildRequestUrl(
        request.endpoint,
        request.params,
        { ...request.params, ...pathParams },
      );
      if (request.method === "GET") {
        throw new Error(
          "Manifest runtime mutations require POST, PUT, PATCH, or DELETE.",
        );
      }
      const requestMethod = request.method;
      const resourceName = isResourceRef(target) ? target.resource : undefined;
      const resourceConfig = resourceName
        ? manifest.resources?.[resourceName]
        : undefined;
      const optimisticConfig = resourceConfig?.optimistic;
      const optimisticQueryKey =
        optimisticConfig && payload
          ? resolveTargetQueryKey(optimisticConfig.target, manifest.resources)
          : null;
      const queueKey = optimisticQueryKey
        ? toCacheKey(optimisticQueryKey)
        : toCacheKey(toQueryKey(request.client, request.method, endpoint));

      const previousChain = mutationChainsRef.current.get(queueKey);
      const chainStart = previousChain
        ? previousChain.catch(() => undefined)
        : Promise.resolve();

      const mutationPromise = chainStart.then(async () => {
        let rollbackSnapshot: ResourceCacheEntry | undefined;
        let optimisticKey: string | null = null;

        if (optimisticConfig && payload && optimisticQueryKey) {
          optimisticKey = toCacheKey(optimisticQueryKey);
          rollbackSnapshot = entriesRef.current[optimisticKey];
          const merge = applyOptimisticMerge(
            rollbackSnapshot?.data,
            payload,
            optimisticConfig,
          );

          if (merge.applied) {
            setEntries((current) => {
              const existing = current[optimisticKey!];
              return {
                ...current,
                [optimisticKey!]: {
                  status: "ready",
                  data: merge.next,
                  updatedAt: Date.now(),
                  resourceName:
                    existing?.resourceName ??
                    (isOptimisticResourceTarget(optimisticConfig.target)
                      ? optimisticConfig.target.resource
                      : optimisticConfig.target),
                  queryKey: existing?.queryKey ?? optimisticQueryKey,
                },
              };
            });
          }
        }

        try {
          const result = await sendMutationRequest(
            request.client,
            requestMethod,
            endpoint,
            payload,
          );
          applyInvalidationTargets(resourceConfig?.invalidates);
          if (optimisticQueryKey) {
            invalidateQueryKey(optimisticQueryKey);
          }
          return result;
        } catch (error) {
          if (optimisticKey) {
            setEntries((current) => {
              const next = { ...current };
              if (rollbackSnapshot) {
                next[optimisticKey] = rollbackSnapshot;
              } else {
                delete next[optimisticKey];
              }
              return next;
            });
          }
          throw error;
        }
      });

      mutationChainsRef.current.set(queueKey, mutationPromise);

      try {
        return await mutationPromise;
      } finally {
        if (mutationChainsRef.current.get(queueKey) === mutationPromise) {
          mutationChainsRef.current.delete(queueKey);
        }
      }
    },
    [
      applyInvalidationTargets,
      invalidateQueryKey,
      manifest.resources,
      sendMutationRequest,
    ],
  );

  const cacheValue = useMemo<ManifestResourceCacheValue>(
    () => ({
      entries: entriesRef.current,
      getResourceVersion: (name) => resourceVersionsRef.current[name] ?? 0,
      getInvalidationTargets: (name) =>
        getResourceInvalidationTargets(name, manifest.resources),
      getCacheKey,
      getEntry: (target, params) => {
        const key = getCacheKey(target, params);
        return key ? entriesRef.current[key] : undefined;
      },
      getData: (target, params) => {
        const key = getCacheKey(target, params);
        const entry = key ? entriesRef.current[key] : undefined;
        return isEntryFresh(entry) ? entry?.data : undefined;
      },
      loadTarget,
      preloadResource: (name, params, options) => loadTarget({ resource: name }, params, options),
      invalidateResource,
      invalidateQueryKey,
      mutateTarget,
    }),
    [
      getCacheKey,
      invalidateQueryKey,
      invalidateResource,
      isEntryFresh,
      loadTarget,
      manifest.resources,
      mutateTarget,
    ],
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

/**
 * Access the manifest resource cache runtime for loads, invalidation, and
 * resource-driven mutations.
 */
export function useManifestResourceCache(): ManifestResourceCacheValue | null {
  return useContext(ManifestResourceCacheContext);
}

export function useRouteRuntime(): RouteRuntimeValue | null {
  return useContext(RouteRuntimeContext);
}

export function useOverlayRuntime(): OverlayRuntimeValue | null {
  return useContext(OverlayRuntimeContext);
}

export function useManifestResourcePolling(
  resourceName?: string,
  enabled: boolean = true,
): void {
  const manifest = useManifestRuntime();
  const resourceCache = useManifestResourceCache();
  const invalidateResource = resourceCache?.invalidateResource;
  const pollMs = resourceName
    ? manifest?.resources?.[resourceName]?.pollMs
    : undefined;

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !enabled ||
      !resourceName ||
      !pollMs ||
      !invalidateResource
    ) {
      return;
    }

    const intervalId = window.setInterval(() => {
      invalidateResource(resourceName);
    }, pollMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled, invalidateResource, pollMs, resourceName]);
}

export function useManifestResourceFocusRefetch(
  resourceName?: string,
  enabled: boolean = true,
): void {
  const manifest = useManifestRuntime();
  const resourceCache = useManifestResourceCache();
  const invalidateResource = resourceCache?.invalidateResource;
  const refetchOnWindowFocus = resourceName
    ? manifest?.resources?.[resourceName]?.refetchOnWindowFocus
    : undefined;

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !enabled ||
      !resourceName ||
      !refetchOnWindowFocus ||
      !invalidateResource
    ) {
      return;
    }

    const handleFocus = () => {
      invalidateResource(resourceName);
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [enabled, invalidateResource, refetchOnWindowFocus, resourceName]);
}

export function useManifestResourceMountRefetch(
  resourceName?: string,
  enabled: boolean = true,
): void {
  const manifest = useManifestRuntime();
  const resourceCache = useManifestResourceCache();
  const invalidateResource = resourceCache?.invalidateResource;
  const refetchOnMount = resourceName
    ? manifest?.resources?.[resourceName]?.refetchOnMount
    : undefined;

  useEffect(() => {
    if (!enabled || !resourceName || !refetchOnMount || !invalidateResource) {
      return;
    }

    invalidateResource(resourceName);
  }, [enabled, invalidateResource, refetchOnMount, resourceName]);
}
