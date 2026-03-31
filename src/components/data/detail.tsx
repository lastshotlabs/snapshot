import { useMemo } from "react";
import type { ApiClient } from "../../api/client";
import { token } from "../../tokens/utils";
import { useDataSource } from "../data-binding";
import type { DetailConfig, DetailFieldConfig } from "./detail.schema";

interface DetailProps {
  config: DetailConfig;
  api: ApiClient;
  id?: string;
}

/**
 * Config-driven detail view — displays a single record as key-value pairs.
 * Auto-detects fields from the response if not specified.
 */
export function Detail({ config, api }: DetailProps) {
  const { data, isLoading, isError, error } = useDataSource(api, {
    source: config.data,
  });

  const record = data as Record<string, unknown> | undefined;

  const fields: DetailFieldConfig[] = useMemo(() => {
    if (config.fields && config.fields !== "auto") return config.fields;
    if (!record) return [];
    return Object.keys(record).map((field) => ({
      field,
      label: field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1"),
    }));
  }, [config.fields, record]);

  if (isLoading) {
    return (
      <div style={{ padding: token("spacing.8"), color: token("colors.muted-foreground") }}>
        Loading...
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: token("spacing.8"), color: token("colors.destructive") }}>
        Error: {error?.message ?? "Failed to load"}
      </div>
    );
  }

  if (!record) {
    return (
      <div style={{ padding: token("spacing.8"), color: token("colors.muted-foreground") }}>
        No data
      </div>
    );
  }

  const cols = config.columns ?? 2;

  return (
    <div
      className={config.className}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: `${token("spacing.4")} ${token("spacing.6")}`,
      }}
    >
      {fields
        .filter((f) => f.visible !== false)
        .map((field) => (
          <div
            key={field.field}
            style={{ gridColumn: field.span ? `span ${field.span}` : undefined }}
          >
            <dt
              style={{
                fontSize: token("typography.fontSize.xs"),
                fontWeight: token("typography.fontWeight.medium"),
                color: token("colors.muted-foreground"),
                textTransform: "uppercase" as const,
                letterSpacing: token("typography.letterSpacing.wide"),
                marginBottom: token("spacing.1"),
              }}
            >
              {field.label ?? field.field}
            </dt>
            <dd
              style={{
                fontSize: token("typography.fontSize.sm"),
                color: token("colors.foreground"),
                margin: 0,
              }}
            >
              {formatValue(record[field.field], field.format)}
            </dd>
          </div>
        ))}
    </div>
  );
}

function formatValue(value: unknown, format?: string): string {
  if (value == null) return "—";
  if (!format) return String(value);

  switch (format) {
    case "date":
      return new Date(value as string | number).toLocaleDateString();
    case "datetime":
      return new Date(value as string | number).toLocaleString();
    case "currency":
      return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(
        value as number,
      );
    case "number":
      return new Intl.NumberFormat().format(value as number);
    case "boolean":
      return value ? "Yes" : "No";
    case "json":
      return JSON.stringify(value, null, 2);
    default:
      return String(value);
  }
}
