import { useState, useEffect, useCallback, useMemo } from "react";
import { useResolveFromMany, useSubscribe } from "../../context/hooks";
import type { FromRef } from "../../context/types";
import {
  buildRequestUrl,
  isResourceRef,
  resolveEndpointTarget,
  type ResourceRef,
} from "../../resources";
import { usePoll } from "../../hooks/use-poll";
import { useApiClient } from "../../state";

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

export interface ComponentDataOptions {
  poll?: {
    interval: number;
    pauseWhenHidden?: boolean;
  };
}

function getInitialInlineData(
  resolvedData: unknown,
): Record<string, unknown> | null {
  if (
    resolvedData == null ||
    typeof resolvedData === "string" ||
    isResourceRef(resolvedData)
  ) {
    return null;
  }

  if (Array.isArray(resolvedData)) {
    return resolvedData as unknown as Record<string, unknown>;
  }

  if (typeof resolvedData === "object") {
    return resolvedData as Record<string, unknown>;
  }

  return null;
}

/**
 * Shared data-fetching hook for Snapshot UI components.
 *
 * Parses a data config string like `"GET /api/stats/revenue"` into method + endpoint,
 * resolves any `FromRef` values in params via `useSubscribe`, and fetches data
 * using the app-scope API client.
 *
 * When the API client is not available (e.g., in tests or before a provider supplies it),
 * the hook returns a loading state without throwing.
 *
 * @param dataConfig - Endpoint string or FromRef. Example: `"GET /api/stats/revenue"`
 * @param params - Optional query parameters, may contain FromRef values
 * @returns Data, loading state, error, and refetch function
 */
export function useComponentData(
  dataConfig: string | FromRef | ResourceRef,
  params?: Record<string, unknown | FromRef>,
  options?: ComponentDataOptions,
): ComponentDataResult {
  const resolvedData = useSubscribe(dataConfig);
  const api = useApiClient();

  // Resolve params that may be FromRef in a single hook call regardless of
  // how many params are present.
  const stableParams = params ?? {};
  const paramKeys = useMemo(() => Object.keys(stableParams), [stableParams]);
  const paramValues = useMemo(
    () => paramKeys.map((k) => stableParams[k]),
    [paramKeys, stableParams],
  );
  const resolvedValues = useResolveFromMany(paramValues);
  const resolvedParams: Record<string, unknown> = {};
  for (let i = 0; i < paramKeys.length; i++) {
    resolvedParams[paramKeys[i]!] = resolvedValues[i];
  }

  const dataString =
    typeof resolvedData === "string" ? resolvedData : undefined;
  const resourceTarget = isResourceRef(resolvedData) ? resolvedData : undefined;

  // Handle inline data (arrays/objects passed directly instead of an endpoint string)
  const isInlineData =
    resolvedData != null &&
    typeof resolvedData !== "string" &&
    !isResourceRef(resolvedData) &&
    (Array.isArray(resolvedData) || typeof resolvedData === "object");
  const initialInlineData = getInitialInlineData(resolvedData);

  const [data, setData] = useState<Record<string, unknown> | null>(
    initialInlineData,
  );
  const [isLoading, setIsLoading] = useState(
    initialInlineData == null &&
      (dataString !== undefined || resourceTarget !== undefined),
  );
  const [error, setError] = useState<Error | null>(null);
  const [fetchCount, setFetchCount] = useState(0);

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
      // No API client yet — remain in loading state until the app runtime provides one.
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const target = resourceTarget ?? dataString!;
      const request = resolveEndpointTarget(target, undefined, resolvedParams);
      const url = buildRequestUrl(request.endpoint, request.params);
      const result = await (async () => {
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
    fetchCount,
    isInlineData,
    resolvedData,
    JSON.stringify(resolvedParams),
  ]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    setFetchCount((c) => c + 1);
  }, []);

  usePoll({
    interval: options?.poll?.interval ?? 1000,
    pauseWhenHidden: options?.poll?.pauseWhenHidden ?? true,
    onPoll: refetch,
    enabled: Boolean(options?.poll),
  });

  return { data, isLoading, error, refetch };
}
