import { useCallback, useContext, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { isFromRef, parseDataString } from "../../../context/utils";
import { SnapshotApiContext } from "../../../actions/executor";
import type { DetailCardConfig, DetailFieldConfig } from "./schema";
import type { ResolvedField, UseDetailCardResult } from "./types";

/**
 * Humanize a camelCase or snake_case field name into a display label.
 * e.g. "firstName" -> "First Name", "created_at" -> "Created At"
 */
function humanizeFieldName(name: string): string {
  return name
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Auto-detect a format type from a field name and value.
 */
function detectFormat(
  field: string,
  value: unknown,
): "text" | "email" | "url" | "boolean" | "date" | "number" | "image" {
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";

  const lower = field.toLowerCase();
  if (lower === "email" || lower.endsWith("email")) return "email";
  if (
    lower === "url" ||
    lower === "website" ||
    lower.endsWith("url") ||
    lower.endsWith("link")
  )
    return "url";
  if (
    lower === "avatar" ||
    lower === "photo" ||
    lower === "image" ||
    lower.endsWith("avatar") ||
    lower.endsWith("image") ||
    lower.endsWith("photo")
  )
    return "image";
  if (
    lower.endsWith("at") ||
    lower.endsWith("date") ||
    lower === "created" ||
    lower === "updated"
  ) {
    // Check if it looks like a date string
    if (typeof value === "string" && !isNaN(Date.parse(value))) return "date";
  }

  return "text";
}

/**
 * Resolve field configurations from a data record.
 * When fields is 'auto', generates field configs from the record's keys.
 * When fields is an explicit array, uses those configs.
 */
function resolveFields(
  data: Record<string, unknown>,
  fieldsConfig: "auto" | DetailFieldConfig[],
): ResolvedField[] {
  if (fieldsConfig === "auto") {
    return Object.entries(data).map(([key, value]) => ({
      field: key,
      label: humanizeFieldName(key),
      value,
      format: detectFormat(key, value),
      copyable: false,
    }));
  }

  return fieldsConfig.map((fc) => ({
    field: fc.field,
    label: fc.label ?? humanizeFieldName(fc.field),
    value: data[fc.field],
    format: fc.format ?? "text",
    copyable: fc.copyable ?? false,
  }));
}

/**
 * Interpolate URL parameters into an endpoint path.
 * Replaces `{paramName}` with the corresponding value from params.
 */
function interpolateEndpoint(
  endpoint: string,
  params: Record<string, unknown>,
): string {
  return endpoint.replace(/\{(\w+)\}/g, (_, key: string) => {
    const val = params[key];
    return val != null ? String(val) : `{${key}}`;
  });
}

/**
 * Hook that powers the DetailCard component.
 * Resolves FromRefs, fetches data from endpoints, formats fields,
 * and publishes the record data for other components to subscribe to.
 *
 * @param config - The DetailCard configuration
 * @returns Data, fields, title, loading/error state, and refetch function
 *
 * @example
 * ```tsx
 * const { data, fields, title, isLoading, error, refetch } = useDetailCard({
 *   type: 'detail-card',
 *   data: { from: 'users-table.selected' },
 *   fields: 'auto',
 * })
 * ```
 */
export function useDetailCard(config: DetailCardConfig): UseDetailCardResult {
  const api = useContext(SnapshotApiContext);
  const queryClient = useQueryClient();

  // Resolve data source — could be a FromRef or an endpoint string
  const isDataFromRef = isFromRef(config.data);
  const subscribedData = useSubscribe(isDataFromRef ? config.data : undefined);

  // Resolve title — could be a FromRef or a static string
  const resolvedTitle = useSubscribe(config.title) as string | undefined;

  // Resolve params — each value could be a FromRef
  const resolvedParams: Record<string, unknown> = {};
  const paramEntries = config.params ? Object.entries(config.params) : [];
  for (const [key, value] of paramEntries) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    resolvedParams[key] = useSubscribe(value);
  }

  // Determine the endpoint for fetching (only used when data is a string)
  const endpointString = !isDataFromRef ? (config.data as string) : null;
  const [method, rawPath] = endpointString
    ? parseDataString(endpointString)
    : ["GET", ""];
  const path =
    rawPath && config.params
      ? interpolateEndpoint(rawPath, resolvedParams)
      : rawPath;

  // Check if all required params are resolved (no undefined values for params used in the path)
  const allParamsResolved =
    !config.params ||
    Object.values(resolvedParams).every((v) => v !== undefined);

  // Fetch data from endpoint when data is a string
  const queryResult = useQuery({
    queryKey: ["detail-card", path, method],
    queryFn: async () => {
      if (!api) {
        throw new Error(
          "useDetailCard: SnapshotApiContext not provided. " +
            "Wrap your app in <SnapshotApiContext.Provider value={apiClient}>.",
        );
      }
      switch (method.toUpperCase()) {
        case "POST":
          return api.post(path, undefined);
        case "PUT":
          return api.put(path, undefined);
        case "PATCH":
          return api.patch(path, undefined);
        case "DELETE":
          return api.delete(path);
        default:
          return api.get(path);
      }
    },
    enabled: !isDataFromRef && !!path && allParamsResolved,
  });

  // Pick the right data source
  const rawData = isDataFromRef
    ? (subscribedData as Record<string, unknown> | null)
    : ((queryResult.data as Record<string, unknown> | null) ?? null);

  const data =
    rawData != null && typeof rawData === "object" && !Array.isArray(rawData)
      ? (rawData as Record<string, unknown>)
      : null;

  // Resolve fields
  const fieldsConfig = config.fields ?? "auto";
  const fields = useMemo(
    () => (data ? resolveFields(data, fieldsConfig) : []),
    [data, fieldsConfig],
  );

  // Publish data for other components
  const publish = usePublish(config.id ?? "");
  useEffect(() => {
    if (config.id && data) {
      publish(data);
    }
  }, [config.id, data, publish]);

  // Refetch function
  const refetch = useCallback(() => {
    if (!isDataFromRef && path) {
      void queryClient.invalidateQueries({
        queryKey: ["detail-card", path, method],
      });
    }
  }, [isDataFromRef, path, method, queryClient]);

  const isLoading = isDataFromRef ? false : queryResult.isLoading;
  const error = isDataFromRef
    ? null
    : queryResult.error instanceof Error
      ? queryResult.error
      : queryResult.error
        ? new Error(String(queryResult.error))
        : null;

  return {
    data,
    fields,
    title: resolvedTitle,
    isLoading,
    error,
    refetch,
  };
}
