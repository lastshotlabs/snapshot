'use client';

import { useMemo } from "react";
import { useResolveFrom, useSubscribe } from "../../../context/hooks";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import { useComponentData } from "../../_base/use-component-data";
import { AuditLogBase } from "./standalone";
import type { AuditLogFilterEntry } from "./standalone";
import type { AuditLogConfig } from "./types";

type AuditRecord = Record<string, unknown>;

/**
 * Manifest adapter — resolves config refs, fetches data, delegates to AuditLogBase.
 */
export function AuditLog({ config }: { config: AuditLogConfig }) {
  const { data, isLoading, error } = useComponentData(config.data, undefined);
  const visible = useSubscribe(config.visible ?? true);
  const resolvedConfig = useResolveFrom({ filters: config.filters });
  const surfaceConfig = extractSurfaceConfig(config);

  const filters = useMemo<AuditLogFilterEntry[]>(
    () =>
      ((resolvedConfig.filters as AuditLogConfig["filters"] | undefined) ??
        config.filters ??
        []
      ).map((filter: NonNullable<AuditLogConfig["filters"]>[number]) => ({
        field: filter.field,
        label: typeof filter.label === "string" ? filter.label : "",
        options: filter.options.map((option: string) =>
          typeof option === "string" ? option : "",
        ),
      })),
    [config.filters, resolvedConfig.filters],
  );

  const items: AuditRecord[] = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data as AuditRecord[];
    for (const key of ["data", "items", "results", "entries", "logs"]) {
      if (Array.isArray(data[key])) return data[key] as AuditRecord[];
    }
    return [];
  }, [data]);

  const pageSize = useMemo(() => {
    if (config.pagination === false) return false as const;
    if (typeof config.pagination === "object") return config.pagination.pageSize;
    return 20;
  }, [config.pagination]);

  if (visible === false) return null;

  return (
    <AuditLogBase
      id={config.id}
      items={items}
      loading={isLoading}
      error={error}
      userField={config.userField}
      actionField={config.actionField}
      timestampField={config.timestampField}
      detailsField={config.detailsField}
      filters={filters}
      pagination={pageSize}
      className={surfaceConfig?.className as string | undefined}
      style={surfaceConfig?.style as React.CSSProperties | undefined}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
