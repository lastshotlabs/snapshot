'use client';

import { useEffect, useMemo } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { AutoEmptyState } from "../../_base/auto-empty-state";
import { AutoErrorState } from "../../_base/auto-error-state";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import { useComponentData } from "../../_base/use-component-data";
import { Icon } from "../../../icons/index";
import {
  formatValue,
  detectNumericField,
  calculateTrend,
  humanizeFieldName,
} from "./format";
import type { StatCardConfig, UseStatCardResult } from "./types";
import type { FromRef } from "../../../context/types";
import {
  normalizeMetricRows,
  resolveMetricFieldName,
  summarizeMetricRows,
} from "../_shared/metric-fields";

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
    { poll: config.poll },
  );
  const normalizedData = useMemo(() => {
    if (!data) {
      return null;
    }

    const rawData = data as unknown;
    const usesRowPayload =
      Array.isArray(rawData) ||
      (rawData != null &&
        typeof rawData === "object" &&
        (Array.isArray((rawData as Record<string, unknown>).data) ||
          Array.isArray((rawData as Record<string, unknown>).items)));

    if (!usesRowPayload) {
      return data;
    }

    return summarizeMetricRows(normalizeMetricRows(rawData), [
      config.field,
      config.trend?.field,
    ]);
  }, [config.field, config.trend?.field, data]);

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

    if (!normalizedData) {
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
    const fieldName =
      resolveMetricFieldName(normalizedData, config.field) ??
      detectNumericField(normalizedData);
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

    const rawValue = normalizedData[fieldName];
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
      divisor: config.divisor,
    });

    // Calculate trend if configured
    let trendResult: UseStatCardResult["trend"] = null;
    if (config.trend) {
      const comparisonField = resolveMetricFieldName(
        normalizedData,
        config.trend.field,
      );
      const comparisonValue = comparisonField
        ? normalizedData[comparisonField]
        : undefined;
      if (
        typeof comparisonValue === "number" &&
        !Number.isNaN(comparisonValue)
      ) {
        const trend = calculateTrend(numericValue, comparisonValue);
        const trendSentiment = config.trend.sentiment ?? "up-is-good";
        const trendFormat = config.trend.format ?? "percent";

        const trendDisplayValue =
          trendFormat === "percent"
            ? `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(Math.abs(trend.percentage))}%`
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
  }, [normalizedData, isLoading, error, config, resolvedLabel]);

  return { ...result, refetch, data: normalizedData };
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
  const publish = usePublish(config.id);

  // Check visibility
  const visible = useSubscribe(config.visible ?? true);

  // Publish value when data changes
  useEffect(() => {
    if (publish && rawValue !== null) {
      publish({ value: rawValue, label, trend });
    }
  }, [publish, rawValue, label, trend]);

  if (visible === false) return null;

  const handleClick = config.action
    ? () => void execute(config.action!)
    : undefined;
  const rootId = config.id ?? "stat-card";

  const loadingVariant = config.loading ?? "skeleton";

  // Trend arrow and color
  const trendColor =
    trend?.sentiment === "positive"
      ? "var(--sn-color-success, #16a34a)"
      : trend?.sentiment === "negative"
        ? "var(--sn-color-destructive, #dc2626)"
        : "var(--sn-color-muted-foreground, #6b7280)";

  const trendArrow =
    trend?.direction === "up"
      ? "\u2191"
      : trend?.direction === "down"
        ? "\u2193"
        : "\u2192";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--sn-spacing-sm, 0.5rem)",
      minWidth: "0",
      overflow: "hidden",
      cursor: handleClick ? "pointer" : undefined,
      hover: handleClick
        ? {
            bg: "var(--sn-color-accent, var(--sn-color-muted))",
          }
        : undefined,
      focus: handleClick
        ? {
            ring: true,
          }
        : undefined,
      style: {
        padding: "var(--sn-card-padding, var(--sn-spacing-lg, 1.5rem))",
        borderRadius: "var(--sn-radius-lg, 0.75rem)",
        boxShadow:
          "var(--sn-card-shadow, var(--sn-shadow-sm, 0 1px 3px rgba(0,0,0,0.1)))",
        border: "var(--sn-card-border, 1px solid var(--sn-color-border, #e5e7eb))",
        backgroundColor: "var(--sn-color-card, #ffffff)",
      },
    },
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
  });
  const loadingSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading`,
    componentSurface: config.slots?.loading,
  });
  const errorSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-error`,
    componentSurface: config.slots?.error,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    implementationBase: {
      style: {
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        color: "var(--sn-color-muted-foreground, #6b7280)",
        fontWeight: "var(--sn-font-weight-medium, 500)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
    },
    componentSurface: config.slots?.label,
  });
  const valueRowSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-value-row`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "var(--sn-spacing-sm, 0.5rem)",
    },
    componentSurface: config.slots?.valueRow,
  });
  const valueSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-value`,
    implementationBase: {
      style: {
        fontSize: "var(--sn-font-size-2xl, 1.5rem)",
        fontWeight: "var(--sn-font-weight-bold, 700)",
        color: "var(--sn-color-foreground, #111827)",
        lineHeight: "var(--sn-leading-tight, 1.25)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        minWidth: 0,
      },
    },
    componentSurface: config.slots?.value,
  });
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-icon`,
    implementationBase: {
      style: {
        flexShrink: 0,
        opacity: "var(--sn-opacity-muted, 0.5)",
      },
    },
    componentSurface: config.slots?.icon,
  });
  const trendSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-trend`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "var(--sn-spacing-xs, 0.25rem)",
      style: {
        fontSize: "var(--sn-font-size-xs, 0.75rem)",
      },
    },
    componentSurface: config.slots?.trend,
  });
  const emptySurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-empty`,
    implementationBase: {
      style: {
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        color: "var(--sn-color-muted-foreground, #6b7280)",
      },
    },
    componentSurface: config.slots?.empty,
  });

  return (
    <div
      data-snapshot-component="stat-card"
      data-snapshot-id={rootId}
      data-testid="stat-card"
      className={rootSurface.className}
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
      style={rootSurface.style}
    >
      {/* Loading state */}
      {isLoading && (
        <div
          data-snapshot-id={`${rootId}-loading`}
          data-testid="stat-card-loading"
          data-loading-variant={loadingVariant}
          className={loadingSurface.className}
          style={loadingSurface.style}
        >
          <div
            style={{
              height: "var(--sn-font-size-sm, 0.875rem)",
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
              height: "var(--sn-font-size-2xl, 2rem)",
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
          data-snapshot-id={`${rootId}-error`}
          data-testid="stat-card-error"
          className={errorSurface.className}
          style={errorSurface.style}
        >
          <AutoErrorState
            config={(config.error ?? {}) as import("../../_base/auto-error-state").AutoErrorStateConfig}
            onRetry={config.error?.retry !== undefined ? refetch : undefined}
          />
        </div>
      )}

      {/* Data state */}
      {!isLoading && !error && value !== null && (
        <>
          {/* Label */}
          <span
            data-snapshot-id={`${rootId}-label`}
            data-testid="stat-card-label"
            className={labelSurface.className}
            style={labelSurface.style}
          >
            {label}
          </span>

          {/* Value + Icon row */}
          <div
            data-snapshot-id={`${rootId}-value-row`}
            className={valueRowSurface.className}
            style={valueRowSurface.style}
          >
            <div
              data-snapshot-id={`${rootId}-value`}
              data-testid="stat-card-value"
              className={valueSurface.className}
              style={valueSurface.style}
            >
              {value}
            </div>
            {config.icon && (
              <span
                data-snapshot-id={`${rootId}-icon`}
                data-testid="stat-card-icon"
                className={iconSurface.className}
                style={{
                  ...(iconSurface.style ?? {}),
                  color: config.iconColor
                    ? `var(--sn-color-${config.iconColor}, ${config.iconColor})`
                    : "var(--sn-color-muted-foreground, #6b7280)",
                }}
                aria-hidden="true"
              >
                <Icon name={config.icon} size={24} />
              </span>
            )}
          </div>

          {/* Trend */}
          {trend && (
            <div
              data-snapshot-id={`${rootId}-trend`}
              data-testid="stat-card-trend"
              className={trendSurface.className}
              style={{
                ...(trendSurface.style ?? {}),
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
          data-snapshot-id={`${rootId}-empty`}
          data-testid="stat-card-empty"
          className={emptySurface.className}
          style={emptySurface.style}
        >
          <AutoEmptyState
            config={
              {
                ...(config.empty ?? {}),
                title:
                  typeof config.empty?.title === "string"
                    ? config.empty.title
                    : "No data available",
              } as import("../../_base/auto-empty-state").AutoEmptyStateConfig
            }
          />
        </div>
      )}
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={loadingSurface.scopedCss} />
      <SurfaceStyles css={errorSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={valueRowSurface.scopedCss} />
      <SurfaceStyles css={valueSurface.scopedCss} />
      <SurfaceStyles css={iconSurface.scopedCss} />
      <SurfaceStyles css={trendSurface.scopedCss} />
      <SurfaceStyles css={emptySurface.scopedCss} />
    </div>
  );
}
