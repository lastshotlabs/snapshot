import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import type { ApiClient } from "../api/client";
import type { ApiError } from "../api/error";
import { usePageValues } from "./page-context";
import type { DataSourceRef } from "./types";
import { parseDataSourceRef } from "./types";

// ── Data source config ───────────────────────────────────────────────────────

export interface DataSourceConfig {
  /** The API endpoint reference (e.g. "GET /api/users" or object form). */
  source: DataSourceRef;
  /** Component ID — used for refresh action targeting. */
  id?: string;
  /** Pagination config. */
  pagination?: {
    type: "cursor" | "offset";
    pageSize?: number;
  };
  /** Polling interval in ms. Overrides the source-level pollInterval. */
  pollInterval?: number;
}

// ── Query data source (GET) ──────────────────────────────────────────────────

export interface QueryDataSourceResult<T = unknown> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  refetch: () => void;
}

/**
 * React hook that fetches data from an API endpoint based on a DataSourceRef.
 *
 * Resolves `{ from: "component-id" }` param references via the page context.
 * Automatically refetches when referenced component values change.
 *
 * @example
 * ```ts
 * const { data, isLoading } = useDataSource(api, {
 *   source: { endpoint: "GET /api/users", params: { status: { from: "status-filter" } } }
 * })
 * ```
 */
export function useDataSource<T = unknown>(
  api: ApiClient,
  config: DataSourceConfig,
): QueryDataSourceResult<T> {
  const { method, path, params, pollInterval: srcPoll } = parseDataSourceRef(config.source);
  const pollInterval = config.pollInterval ?? srcPoll;

  // Collect all `{ from: "id" }` references to resolve from page context
  const fromRefs = useMemo(() => {
    if (!params) return [];
    return Object.entries(params)
      .filter(
        (entry): entry is [string, { from: string }] =>
          typeof entry[1] === "object" && entry[1] !== null && "from" in entry[1],
      )
      .map(([key, ref]) => ({ key, sourceId: ref.from }));
  }, [params]);

  const sourceIds = useMemo(() => fromRefs.map((r) => r.sourceId), [fromRefs]);
  const pageValues = usePageValues(sourceIds);

  // Build the resolved path with query params
  const resolvedPath = useMemo(() => {
    if (!params) return path;

    const queryParts: string[] = [];
    let resolvedPath = path;

    for (const [key, value] of Object.entries(params)) {
      let resolvedValue: string;
      if (typeof value === "object" && value !== null && "from" in value) {
        const pageVal = pageValues.get(value.from);
        resolvedValue = pageVal != null ? String(pageVal) : "";
      } else {
        resolvedValue = String(value);
      }

      // Check if this is a path param (appears in the URL as :key or {key})
      if (resolvedPath.includes(`{${key}}`)) {
        resolvedPath = resolvedPath.replace(`{${key}}`, encodeURIComponent(resolvedValue));
      } else if (resolvedPath.includes(`:${key}`)) {
        resolvedPath = resolvedPath.replace(`:${key}`, encodeURIComponent(resolvedValue));
      } else if (resolvedValue) {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(resolvedValue)}`);
      }
    }

    if (queryParts.length > 0) {
      resolvedPath += (resolvedPath.includes("?") ? "&" : "?") + queryParts.join("&");
    }

    return resolvedPath;
  }, [path, params, pageValues]);

  // Build stable query key. Include component ID when present so refresh actions can target by ID.
  const queryKey = useMemo(
    () =>
      config.id
        ? ["data-source", config.id, method, resolvedPath]
        : ["data-source", method, resolvedPath],
    [config.id, method, resolvedPath],
  );

  const result = useQuery<T, ApiError>({
    queryKey,
    queryFn: () => api.get<T>(resolvedPath),
    enabled: method === "GET",
    refetchInterval: pollInterval,
  });

  const refetch = useCallback(() => {
    void result.refetch();
  }, [result.refetch]);

  return {
    data: result.data,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch,
  };
}

// ── Mutation data source (POST/PUT/PATCH/DELETE) ─────────────────────────────

export interface MutationDataSourceResult<TData = unknown, TBody = unknown> {
  mutate: UseMutationResult<TData, ApiError, TBody>["mutate"];
  mutateAsync: UseMutationResult<TData, ApiError, TBody>["mutateAsync"];
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
}

/**
 * React hook for mutating data via an API endpoint.
 *
 * @example
 * ```ts
 * const { mutateAsync, isLoading } = useMutationSource(api, {
 *   source: "POST /api/users",
 * })
 * await mutateAsync({ email: 'test@test.com', name: 'Test' })
 * ```
 */
export function useMutationSource<TData = unknown, TBody = unknown>(
  api: ApiClient,
  config: { source: DataSourceRef; invalidateKeys?: string[][] },
): MutationDataSourceResult<TData, TBody> {
  const { method, path } = parseDataSourceRef(config.source);
  const queryClient = useQueryClient();

  const mutation = useMutation<TData, ApiError, TBody>({
    mutationFn: (body: TBody) => {
      switch (method) {
        case "POST":
          return api.post<TData>(path, body);
        case "PUT":
          return api.put<TData>(path, body);
        case "PATCH":
          return api.patch<TData>(path, body);
        case "DELETE":
          return api.delete<TData>(path, body);
        default:
          return api.post<TData>(path, body);
      }
    },
    onSuccess: () => {
      if (config.invalidateKeys) {
        for (const key of config.invalidateKeys) {
          queryClient.invalidateQueries({ queryKey: key });
        }
      }
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
