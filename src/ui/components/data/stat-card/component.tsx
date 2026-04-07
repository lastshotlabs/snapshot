import { useEffect, useMemo } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { useComponentData } from "../../_base/use-component-data";
import {
  formatValue,
  detectNumericField,
  calculateTrend,
  humanizeFieldName,
} from "./format";
import type { StatCardConfig, UseStatCardResult } from "./types";
import type { FromRef } from "../../../context/types";

/**
 * Derive the sentiment label from direction and sentiment config.
 */
function deriveSentiment(
  direction: "up" | "down" | "flat",
  sentiment: "up-is-good" | "up-is-bad",
): "positive" | "negative" | "neutral" {
  if (direction === "flat") return "neutral";
  if (sentiment === "up-is-good") {
    return direction === "up" ? "positive" : "negative";
  }
  // up-is-bad
  return direction === "up" ? "negative" : "positive";
}

/**
 * Internal hook that encapsulates all StatCard logic.
 * Extracts from the config, fetches data, formats values, and computes trend.
 */
function useStatCardLogic(config: StatCardConfig): UseStatCardResult {
  const resolvedLabel = useSubscribe(config.label) as string | undefined;
  const { data, isLoading, error, refetch } = useComponentData(
    config.data,
    config.params as Record<string, unknown | FromRef> | undefined,
  );

  const result = useMemo((): Omit<UseStatCardResult, "refetch" | "data"> => {
    if (isLoading) {
      return {
        value: null,
        rawValue: null,
        label: resolvedLabel ?? "",
        isLoading: true,
        error: null,
        trend: null,
      };
    }

    if (error) {
      return {
        value: null,
        rawValue: null,
        label: resolvedLabel ?? "",
        isLoading: false,
        error,
        trend: null,
      };
    }

    if (!data) {
      return {
        value: null,
        rawValue: null,
        label: resolvedLabel ?? "",
        isLoading: false,
        error: null,
        trend: null,
      };
    }

    // Determine which field to display
    const fieldName = config.field ?? detectNumericField(data);
    if (!fieldName) {
      return {
        value: null,
        rawValue: null,
        label: resolvedLabel ?? "",
        isLoading: false,
        error: new Error("No numeric field found in response"),
        trend: null,
      };
    }

    const rawValue = data[fieldName];
    const numericValue =
      typeof rawValue === "number" ? rawValue : Number(rawValue);
    if (Number.isNaN(numericValue)) {
      return {
        value: null,
        rawValue: null,
        label: resolvedLabel ?? humanizeFieldName(fieldName),
        isLoading: false,
        error: new Error(`Field "${fieldName}" is not a number`),
        trend: null,
      };
    }

    const label = resolvedLabel ?? humanizeFieldName(fieldName);
    const formatted = formatValue(numericValue, config.format, {
      currency: config.currency,
      decimals: config.decimals,
      prefix: config.prefix,
      suffix: config.suffix,
    });

    // Calculate trend if configured
    let trendResult: UseStatCardResult["trend"] = null;
    if (config.trend) {
      const comparisonValue = data[config.trend.field];
      if (
        typeof comparisonValue === "number" &&
        !Number.isNaN(comparisonValue)
      ) {
        const trend = calculateTrend(numericValue, comparisonValue);
        const trendSentiment = config.trend.sentiment ?? "up-is-good";
        const trendFormat = config.trend.format ?? "percent";

        const trendDisplayValue =
          trendFormat === "percent"
            ? `${Math.abs(trend.percentage).toFixed(1)}%`
            : formatValue(trend.value, config.format, {
                currency: config.currency,
                decimals: config.decimals,
              });

        trendResult = {
          direction: trend.direction,
          value: trendDisplayValue,
          percentage: trend.percentage,
          sentiment: deriveSentiment(trend.direction, trendSentiment),
        };
      }
    }

    return {
      value: formatted,
      rawValue: numericValue,
      label,
      isLoading: false,
      error: null,
      trend: trendResult,
    };
  }, [data, isLoading, error, config, resolvedLabel]);

  return { ...result, refetch, data };
}

/**
 * StatCard component — a data-fetching card that displays a single metric
 * with optional trend indicator.
 *
 * Fetches data from the configured endpoint, formats the value according
 * to the format config, and optionally shows a trend arrow with color
 * coding based on sentiment.
 *
 * @param props - Component props containing the stat card configuration
 *
 * @example
 * ```json
 * {
 *   "type": "stat-card",
 *   "id": "revenue-card",
 *   "data": "GET /api/stats/revenue",
 *   "field": "total",
 *   "label": "Revenue",
 *   "format": "currency",
 *   "trend": { "field": "previousTotal", "sentiment": "up-is-good" }
 * }
 * ```
 */
export function StatCard({ config }: { config: StatCardConfig }) {
  const { value, rawValue, label, isLoading, error, trend, refetch } =
    useStatCardLogic(config);
  const execute = useActionExecutor();
  const publish = config.id ? usePublish(config.id) : undefined; // eslint-disable-line react-hooks/rules-of-hooks

  // Check visibility
  const visible = useSubscribe(config.visible ?? true);
  if (visible === false) return null;

  // Publish value when data changes
  useEffect(() => {
    if (publish && rawValue !== null) {
      publish({ value: rawValue, label, trend });
    }
  }, [publish, rawValue, label, trend]);

  const handleClick = config.action
    ? () => void execute(config.action!)
    : undefined;

  const loadingVariant = config.loading ?? "skeleton";

  // Trend arrow and color
  const trendColor =
    trend?.sentiment === "positive"
      ? "var(--sn-color-success, #16a34a)"
      : trend?.sentiment === "negative"
        ? "var(--sn-color-danger, #dc2626)"
        : "var(--sn-color-muted, #6b7280)";

  const trendArrow =
    trend?.direction === "up"
      ? "\u2191"
      : trend?.direction === "down"
        ? "\u2193"
        : "\u2192";

  return (
    <div
      data-snapshot-component="stat-card"
      data-testid="stat-card"
      className={config.className}
      onClick={handleClick}
      onKeyDown={
        handleClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") handleClick();
            }
          : undefined
      }
      role={handleClick ? "button" : undefined}
      tabIndex={handleClick ? 0 : undefined}
      style={{
        padding: "var(--sn-spacing-lg, 1.5rem)",
        borderRadius: "var(--sn-radius-lg, 0.75rem)",
        boxShadow: "var(--sn-shadow-card, 0 1px 3px rgba(0,0,0,0.1))",
        border: "1px solid var(--sn-color-border, #e5e7eb)",
        backgroundColor: "var(--sn-color-card-bg, #ffffff)",
        cursor: handleClick ? "pointer" : undefined,
        display: "flex",
        flexDirection: "column",
        gap: "var(--sn-spacing-sm, 0.5rem)",
      }}
    >
      {/* Loading state */}
      {isLoading && (
        <div
          data-testid="stat-card-loading"
          data-loading-variant={loadingVariant}
        >
          <div
            style={{
              height: "0.875rem",
              width: "40%",
              backgroundColor: "var(--sn-color-muted, #e5e7eb)",
              borderRadius: "var(--sn-radius-sm, 0.25rem)",
              marginBottom: "var(--sn-spacing-sm, 0.5rem)",
              animation:
                loadingVariant === "pulse"
                  ? "pulse 2s ease-in-out infinite"
                  : undefined,
            }}
          />
          <div
            style={{
              height: "2rem",
              width: "60%",
              backgroundColor: "var(--sn-color-muted, #e5e7eb)",
              borderRadius: "var(--sn-radius-sm, 0.25rem)",
              animation:
                loadingVariant === "pulse"
                  ? "pulse 2s ease-in-out infinite"
                  : undefined,
            }}
          />
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div
          data-testid="stat-card-error"
          style={{ color: "var(--sn-color-danger, #dc2626)" }}
        >
          <span style={{ fontSize: "0.875rem" }}>Failed to load</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              refetch();
            }}
            style={{
              marginLeft: "var(--sn-spacing-sm, 0.5rem)",
              fontSize: "0.75rem",
              textDecoration: "underline",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "inherit",
              padding: 0,
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Data state */}
      {!isLoading && !error && value !== null && (
        <>
          {/* Header: icon + label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--sn-spacing-xs, 0.25rem)",
            }}
          >
            {config.icon && (
              <span
                data-testid="stat-card-icon"
                style={{
                  color: config.iconColor
                    ? `var(--sn-color-${config.iconColor}, ${config.iconColor})`
                    : "var(--sn-color-muted, #6b7280)",
                  fontSize: "1rem",
                }}
                aria-hidden="true"
              >
                {config.icon}
              </span>
            )}
            <span
              data-testid="stat-card-label"
              style={{
                fontSize: "0.875rem",
                color: "var(--sn-color-muted-foreground, #6b7280)",
                fontWeight: 500,
              }}
            >
              {label}
            </span>
          </div>

          {/* Value */}
          <div
            data-testid="stat-card-value"
            style={{
              fontSize: "1.875rem",
              fontWeight: 700,
              color: "var(--sn-color-foreground, #111827)",
              lineHeight: 1.2,
            }}
          >
            {value}
          </div>

          {/* Trend */}
          {trend && (
            <div
              data-testid="stat-card-trend"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--sn-spacing-xs, 0.25rem)",
                fontSize: "0.875rem",
                color: trendColor,
              }}
            >
              <span aria-label={`Trend ${trend.direction}`}>{trendArrow}</span>
              <span>{trend.value}</span>
            </div>
          )}
        </>
      )}

      {/* Empty state — no data and no error */}
      {!isLoading && !error && value === null && (
        <div
          data-testid="stat-card-empty"
          style={{
            fontSize: "0.875rem",
            color: "var(--sn-color-muted-foreground, #6b7280)",
          }}
        >
          No data available
        </div>
      )}
    </div>
  );
}
