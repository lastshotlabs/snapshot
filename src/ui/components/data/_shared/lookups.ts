import { useEffect, useMemo, useState } from "react";
import { getNestedValue } from "../../../context/utils";
import {
  buildRequestUrl,
  resolveEndpointTarget,
} from "../../../manifest/resources";
import {
  useManifestResourceCache,
  useManifestRuntime,
} from "../../../manifest/runtime";
import { useApiClient } from "../../../state";

export interface LookupConfig {
  resource: string;
  valueField?: string;
  labelField?: string;
}

export interface LookupDefinition {
  key: string;
  lookup: LookupConfig;
}

function normalizeLookupRows(
  value: unknown,
): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value as Record<string, unknown>[];
  }

  if (value != null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record["items"])) {
      return record["items"] as Record<string, unknown>[];
    }
    if (Array.isArray(record["data"])) {
      return record["data"] as Record<string, unknown>[];
    }
  }

  return [];
}

export function getFieldValue(
  record: Record<string, unknown>,
  field: string,
): unknown {
  if (!field.includes(".")) {
    return record[field];
  }
  return getNestedValue(record, field);
}

function getLookupLabel(
  row: Record<string, unknown>,
  lookup: LookupConfig,
): unknown {
  const explicitLabel = lookup.labelField
    ? getFieldValue(row, lookup.labelField)
    : undefined;
  if (explicitLabel != null && explicitLabel !== "") {
    return explicitLabel;
  }

  for (const candidate of ["name", "label", "title"]) {
    const value = getFieldValue(row, candidate);
    if (value != null && value !== "") {
      return value;
    }
  }

  return getFieldValue(row, lookup.valueField ?? "id");
}

export function getLookupSignature(lookup: LookupConfig): string {
  return [
    lookup.resource,
    lookup.valueField ?? "id",
    lookup.labelField ?? "",
  ].join("::");
}

export function resolveLookupValue(
  value: unknown,
  lookup: LookupConfig | undefined,
  lookupMaps: Record<string, Map<string, unknown>>,
): unknown {
  if (!lookup || value == null) {
    return value;
  }

  const map = lookupMaps[getLookupSignature(lookup)];
  if (!map) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => map.get(String(entry)) ?? entry);
  }

  return map.get(String(value)) ?? value;
}

export function useLookupMaps(
  definitions: LookupDefinition[],
): Record<string, Map<string, unknown>> {
  const api = useApiClient();
  const runtime = useManifestRuntime();
  const resourceCache = useManifestResourceCache();
  const [resourceRows, setResourceRows] = useState<
    Record<string, Record<string, unknown>[]>
  >({});

  const uniqueResources = useMemo(() => {
    const seen = new Set<string>();
    return definitions
      .map((definition) => definition.lookup.resource)
      .filter((resource) => {
        if (seen.has(resource)) {
          return false;
        }
        seen.add(resource);
        return true;
      });
  }, [definitions]);
  const uniqueResourcesKey = uniqueResources.join("|");

  useEffect(() => {
    let cancelled = false;

    if (uniqueResources.length === 0) {
      setResourceRows({});
      return () => {
        cancelled = true;
      };
    }

    if (!resourceCache && !api) {
      return () => {
        cancelled = true;
      };
    }

    const load = async () => {
      const results = await Promise.all(
        uniqueResources.map(async (resource) => {
          try {
            const target = { resource };
            const response = resourceCache
              ? await resourceCache.loadTarget(target, {})
              : await (async () => {
                  const request = resolveEndpointTarget(
                    target,
                    runtime?.resources,
                    {},
                  );
                  if (!api) {
                    return [];
                  }
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

            return [resource, normalizeLookupRows(response)] as const;
          } catch {
            return [resource, []] as const;
          }
        }),
      );

      if (!cancelled) {
        setResourceRows(Object.fromEntries(results));
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [api, resourceCache, runtime?.resources, uniqueResourcesKey]);

  return useMemo(() => {
    const lookupMaps: Record<string, Map<string, unknown>> = {};

    for (const definition of definitions) {
      const signature = getLookupSignature(definition.lookup);
      if (lookupMaps[signature]) {
        continue;
      }

      const rows = resourceRows[definition.lookup.resource] ?? [];
      const map = new Map<string, unknown>();
      for (const row of rows) {
        const value = getFieldValue(row, definition.lookup.valueField ?? "id");
        if (value == null) {
          continue;
        }
        map.set(String(value), getLookupLabel(row, definition.lookup));
      }
      lookupMaps[signature] = map;
    }

    return lookupMaps;
  }, [definitions, resourceRows]);
}
