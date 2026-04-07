import { useState, useEffect, useCallback, useContext } from "react";
import { useSubscribe } from "../../context/hooks";
import { isFromRef, parseDataString } from "../../context/utils";
import { SnapshotApiContext } from "../../actions/executor";
import type { FromRef } from "../../context/types";

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
  dataConfig: string | FromRef,
  params?: Record<string, unknown | FromRef>,
): ComponentDataResult {
  const resolvedData = useSubscribe(dataConfig);
  const api = useContext(SnapshotApiContext);

  // Resolve params that may be FromRef
  const resolvedParams: Record<string, unknown> = {};
  const paramEntries = params ? Object.entries(params) : [];
  for (const [key, value] of paramEntries) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    resolvedParams[key] = useSubscribe(isFromRef(value) ? value : value);
  }

  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [fetchCount, setFetchCount] = useState(0);

  const dataString =
    typeof resolvedData === "string" ? resolvedData : undefined;

  const fetchData = useCallback(async () => {
    if (!dataString) {
      setIsLoading(false);
      return;
    }

    if (!api) {
      // No API client — remain in loading state.
      // In a full ManifestApp setup, SnapshotApiContext will be provided.
      setIsLoading(false);
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [method, endpoint] = parseDataString(dataString);
      let result: unknown;

      // Build query string from resolved params
      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(resolvedParams)) {
        if (value !== undefined && value !== null) {
          queryParams.set(key, String(value));
        }
      }
      const queryString = queryParams.toString();
      const url = queryString ? `${endpoint}?${queryString}` : endpoint;

      switch (method.toUpperCase()) {
        case "POST":
          result = await api.post(url, undefined);
          break;
        case "PUT":
          result = await api.put(url, undefined);
          break;
        case "PATCH":
          result = await api.patch(url, undefined);
          break;
        case "DELETE":
          result = await api.delete(url);
          break;
        default:
          result = await api.get(url);
      }

      setData(result as Record<string, unknown>);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch data"));
      setData(null);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataString, api, fetchCount]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    setFetchCount((c) => c + 1);
  }, []);

  return { data, isLoading, error, refetch };
}
