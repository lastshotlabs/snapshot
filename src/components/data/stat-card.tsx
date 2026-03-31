import type { ApiClient } from "../../api/client";
import { token } from "../../tokens/utils";
import { useDataSource } from "../data-binding";
import type { StatCardConfig } from "./stat-card.schema";

interface StatCardProps {
  config: StatCardConfig;
  api: ApiClient;
  id?: string;
}

/**
 * Config-driven stat card — displays a single metric with optional trend indicator.
 * Can be static (value in config) or data-bound (fetched from endpoint).
 */
export function StatCard({ config, api }: StatCardProps) {
  const hasDataSource = !!config.data;
  const { data, isLoading } = useDataSource(api, {
    source: config.data ?? "GET /",
    ...(hasDataSource ? {} : { pollInterval: undefined }),
  });

  const record = data as Record<string, unknown> | undefined;

  const displayValue =
    hasDataSource && record ? record[config.valueField ?? "value"] : config.value;

  const trendValue =
    hasDataSource && record && config.trend?.field
      ? (record[config.trend.field] as number | undefined)
      : config.trend?.value;

  const formattedValue = formatStatValue(displayValue, config.format);
  const isPositiveTrend = trendValue != null && trendValue > 0;
  const isNegativeTrend = trendValue != null && trendValue < 0;

  return (
    <div
      className={config.className}
      style={{
        padding: token("spacing.6"),
        borderRadius: token("radius.lg"),
        border: `1px solid ${token("colors.border")}`,
        backgroundColor: token("colors.card"),
      }}
    >
      <div
        style={{
          fontSize: token("typography.fontSize.sm"),
          fontWeight: token("typography.fontWeight.medium"),
          color: token("colors.muted-foreground"),
          marginBottom: token("spacing.2"),
        }}
      >
        {config.label}
      </div>

      <div
        style={{
          fontSize: token("typography.fontSize.3xl"),
          fontWeight: token("typography.fontWeight.bold"),
          color: token("colors.foreground"),
          lineHeight: token("typography.lineHeight.none"),
        }}
      >
        {isLoading && hasDataSource ? "..." : formattedValue}
      </div>

      {trendValue != null && (
        <div
          style={{
            marginTop: token("spacing.2"),
            fontSize: token("typography.fontSize.xs"),
            color: isPositiveTrend
              ? "oklch(0.55 0.15 145)"
              : isNegativeTrend
                ? token("colors.destructive")
                : token("colors.muted-foreground"),
          }}
        >
          {isPositiveTrend ? "↑" : isNegativeTrend ? "↓" : "→"} {Math.abs(trendValue).toFixed(1)}%
          {config.trend?.label && ` ${config.trend.label}`}
        </div>
      )}
    </div>
  );
}

function formatStatValue(value: unknown, format?: string): string {
  if (value == null) return "—";
  if (!format) return String(value);

  switch (format) {
    case "number":
      return new Intl.NumberFormat().format(value as number);
    case "currency":
      return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(
        value as number,
      );
    case "percent":
      return `${(value as number).toFixed(1)}%`;
    case "compact":
      return new Intl.NumberFormat(undefined, { notation: "compact" }).format(value as number);
    default:
      return String(value);
  }
}
