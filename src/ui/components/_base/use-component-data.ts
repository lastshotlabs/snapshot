import { useState, useEffect, useCallback, useContext } from "react";
import { useSubscribe } from "../../context/hooks";
import { isFromRef } from "../../context/utils";
import { SnapshotApiContext } from "../../actions/executor";
import type { FromRef } from "../../context/types";
import {
  buildRequestUrl,
  isResourceRef,
  resolveEndpointTarget,
  type ResourceRef,
} from "../../manifest/resources";
import {
  useManifestResourceMountRefetch,
  useManifestResourceFocusRefetch,
  useManifestResourceCache,
  useManifestResourcePolling,
  useManifestRuntime,
} from "../../manifest/runtime";

/**
 * Result returned by `useComponentData`.
 * Provides the fetched data, loading/error states, and a refetch function.
 */
export interface ComponentDataResult {
  /** The response data, or null if not yet loaded or errored. */
  data: Record<string, unknown> | null;
  /** Whether the initial fetch is in progress. */
  isLoading: boolean;
  /** Error from the last fetch attempt, or null. */
  error: Error | null;
  /** Manually re-fetch the data. */
  refetch: () => void;
}

/**
 * Shared data-fetching hook for config-driven components.
 *
 * Parses a data config string like `"GET /api/stats/revenue"` into method + endpoint,
 * resolves any `FromRef` values in params via `useSubscribe`, and fetches data
 * using the API client from `SnapshotApiContext`.
 *
 * When the API client is not available (e.g., in tests or before ManifestApp provides it),
 * the hook returns a loading state without throwing.
 *
 * @param dataConfig - Endpoint string or FromRef. Example: `"GET /api/stats/revenue"`
 * @param params - Optional query parameters, may contain FromRef values
 * @returns Data, loading state, error, and refetch function
 */
export function useComponentData(
  dataConfig: string | FromRef | ResourceRef,
  params?: Record<string, unknown | FromRef>,
): ComponentDataResult {
  const resolvedData = useSubscribe(dataConfig);
  const api = useContext(SnapshotApiContext);
  const runtime = useManifestRuntime();
  const resourceCache = useManifestResourceCache();

  // Resolve params that may be FromRef — use useResolveFrom to handle
  // all FromRef params in one stable hook call instead of a loop.
  const resolvedParams: Record<string, unknown> = {};
  const stableParams = params ?? {};
  // Collect resolved values. We subscribe to each param value individually
  // but use a stable key set. Callers must not change the set of param keys
  // between renders (which matches config-driven usage where params come from schema).
  const paramKeys = Object.keys(stableParams);
  const paramValues = paramKeys.map((k) => stableParams[k]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const resolved0 = useSubscribe(paramValues[0] ?? null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const resolved1 = useSubscribe(paramValues[1] ?? null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const resolved2 = useSubscribe(paramValues[2] ?? null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const resolved3 = useSubscribe(paramValues[3] ?? null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const resolved4 = useSubscribe(paramValues[4] ?? null);
  const resolvedArr = [resolved0, resolved1, resolved2, resolved3, resolved4];
  for (let i = 0; i < paramKeys.length && i < 5; i++) {
    resolvedParams[paramKeys[i]!] = resolvedArr[i];
  }

  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [fetchCount, setFetchCount] = useState(0);

  const dataString =
    typeof resolvedData === "string" ? resolvedData : undefined;
  const resourceTarget = isResourceRef(resolvedData) ? resolvedData : undefined;
  const resourceVersion = resourceTarget
    ? (resourceCache?.getResourceVersion(resourceTarget.resource) ?? 0)
    : 0;
  useManifestResourceMountRefetch(resourceTarget?.resource, true);
  useManifestResourcePolling(resourceTarget?.resource, true);
  useManifestResourceFocusRefetch(resourceTarget?.resource, true);

  // Handle inline data (arrays/objects passed directly instead of an endpoint string)
  const isInlineData =
    resolvedData != null &&
    typeof resolvedData !== "string" &&
    !isResourceRef(resolvedData) &&
    (Array.isArray(resolvedData) || typeof resolvedData === "object");

  const fetchData = useCallback(async () => {
    if (isInlineData) {
      setData(
        Array.isArray(resolvedData)
          ? (resolvedData as unknown as Record<string, unknown>)
          : (resolvedData as Record<string, unknown>),
      );
      setIsLoading(false);
      return;
    }

    if (!dataString && !resourceTarget) {
      setIsLoading(false);
      return;
    }

    if (!api) {
      // No API client — remain in loading state until SnapshotApiContext is provided.
      // In a full ManifestApp setup, SnapshotApiContext is always provided.
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const target = resourceTarget ?? dataString!;
      const cachedData = resourceCache?.getData(target, resolvedParams);
      const result =
        cachedData !== undefined
          ? cachedData
          : resourceCache
            ? await resourceCache.loadTarget(target, resolvedParams)
            : await (async () => {
                const request = resolveEndpointTarget(
                  target,
                  runtime?.resources,
                  resolvedParams,
                );
                const url = buildRequestUrl(request.endpoint, request.params);
                switch (request.method) {
                  case "POST":
                    return api.post(url, undefined);
                  case "PUT":
                    return api.put(url, undefined);
                  case "PATCH":
                    return api.patch(url, undefined);
                  case "DELETE":
                    return api.delete(url);
                  default:
                    return api.get(url);
                }
              })();

      setData(result as Record<string, unknown>);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch data"));
      setData(null);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dataString,
    resourceTarget,
    api,
    runtime?.resources,
    resourceCache,
    fetchCount,
    isInlineData,
    resolvedData,
    resourceVersion,
    JSON.stringify(resolvedParams),
  ]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    setFetchCount((c) => c + 1);
  }, []);

  return { data, isLoading, error, refetch };
}
