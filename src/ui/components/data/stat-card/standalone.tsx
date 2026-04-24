'use client';

import type { CSSProperties } from "react";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StatCardTrend {
  /** Trend direction arrow. */
  direction: "up" | "down" | "flat";
  /** Formatted trend value (e.g. "+12%"). */
  value: string;
  /** Numeric percentage change. */
  percentage: number;
  /** Sentiment controls trend color. */
  sentiment: "positive" | "negative" | "neutral";
}

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface StatCardBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Formatted display value. */
  value: string | null;
  /** Label text. */
  label: string;
  /** Whether data is loading. */
  isLoading?: boolean;
  /** Error message. */
  error?: string | null;
  /** Icon name. */
  icon?: string;
  /** Icon color token. */
  iconColor?: string;
  /** Loading variant. */
  loadingVariant?: "skeleton" | "pulse";
  /** Trend indicator. */
  trend?: StatCardTrend | null;
  /** Callback when the card is clicked. */
  onClick?: () => void;
  /** Empty state message. */
  emptyMessage?: string;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, label, value, valueRow, icon, trend, loading, error, empty). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone StatCard — displays a single metric with optional trend indicator.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <StatCardBase
 *   label="Monthly Revenue"
 *   value="$12,450"
 *   icon="dollar-sign"
 *   trend={{ direction: "up", value: "+8.2%", percentage: 8.2, sentiment: "positive" }}
 *   onClick={() => navigate("/revenue")}
 * />
 * ```
 */
export function StatCardBase({
  id,
  value,
  label,
  isLoading = false,
  error,
  icon,
  iconColor,
  loadingVariant = "skeleton",
  trend,
  onClick,
  emptyMessage = "No data available",
  className,
  style,
  slots,
}: StatCardBaseProps) {
  const rootId = id ?? "stat-card";

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
      cursor: onClick ? "pointer" : undefined,
      hover: onClick
        ? {
            bg: "var(--sn-color-accent, var(--sn-color-muted))",
          }
        : undefined,
      focus: onClick
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
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const loadingSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading`,
    componentSurface: slots?.loading,
  });
  const errorSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-error`,
    componentSurface: slots?.error,
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
    componentSurface: slots?.label,
  });
  const valueRowSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-value-row`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "var(--sn-spacing-sm, 0.5rem)",
    },
    componentSurface: slots?.valueRow,
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
    componentSurface: slots?.value,
  });
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-icon`,
    implementationBase: {
      style: {
        flexShrink: 0,
        opacity: "var(--sn-opacity-muted, 0.5)",
      },
    },
    componentSurface: slots?.icon,
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
    componentSurface: slots?.trend,
  });
  const emptySurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-empty`,
    implementationBase: {
      style: {
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        color: "var(--sn-color-muted-foreground, #6b7280)",
      },
    },
    componentSurface: slots?.empty,
  });

  return (
    <div
      data-snapshot-component="stat-card"
      data-snapshot-id={rootId}
      data-testid="stat-card"
      className={rootSurface.className}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
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
          <span style={{ color: "var(--sn-color-destructive, #dc2626)" }}>
            {error}
          </span>
        </div>
      )}

      {/* Data state */}
      {!isLoading && !error && value !== null && (
        <>
          <span
            data-snapshot-id={`${rootId}-label`}
            data-testid="stat-card-label"
            className={labelSurface.className}
            style={labelSurface.style}
          >
            {label}
          </span>

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
            {icon && (
              <span
                data-snapshot-id={`${rootId}-icon`}
                data-testid="stat-card-icon"
                className={iconSurface.className}
                style={{
                  ...(iconSurface.style ?? {}),
                  color: iconColor
                    ? `var(--sn-color-${iconColor}, ${iconColor})`
                    : "var(--sn-color-muted-foreground, #6b7280)",
                }}
                aria-hidden="true"
              >
                <Icon name={icon} size={24} />
              </span>
            )}
          </div>

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

      {/* Empty state */}
      {!isLoading && !error && value === null && (
        <div
          data-snapshot-id={`${rootId}-empty`}
          data-testid="stat-card-empty"
          className={emptySurface.className}
          style={emptySurface.style}
        >
          {emptyMessage}
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
