'use client';

import { cloneElement, useMemo, type ReactElement, type ReactNode } from "react";
import type { CSSProperties } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  Treemap,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ChartBaseSeries {
  /** Data key for this series in each row object. */
  key: string;
  /** Display label for this series in legends and tooltips. */
  label?: string;
  /** Color override for this series (CSS value or token). */
  color?: string;
  /** Divisor to apply to numeric values (e.g. 100 for cents-to-dollars). */
  divisor?: number;
}

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface ChartBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Chart type. */
  chartType:
    | "line"
    | "bar"
    | "area"
    | "pie"
    | "donut"
    | "radar"
    | "scatter"
    | "treemap"
    | "funnel"
    | "sparkline";
  /** Chart data rows. */
  data: Record<string, unknown>[];
  /** Key for the X axis. */
  xKey: string;
  /** Series definitions. */
  series: ChartBaseSeries[];
  /** Chart container height. */
  height?: number | string;
  /** Aspect ratio. */
  aspectRatio?: string;
  /** Whether to show the grid. */
  grid?: boolean;
  /** Whether to show the legend. */
  legend?: boolean;
  /** Whether the chart is loading. */
  isLoading?: boolean;
  /** Error message. */
  error?: string | null;
  /** Text shown when data is empty. */
  emptyMessage?: string;
  /** Whether to hide when empty. */
  hideWhenEmpty?: boolean;
  /** Whether new data is available (for live updates). */
  hasNewData?: boolean;
  /** Callback to refresh data. */
  onRefresh?: () => void;
  /** Callback when a chart point is clicked. */
  onPointClick?: (payload: Record<string, unknown>, seriesKey?: string) => void;
  /** Custom loading content. */
  loadingContent?: ReactNode;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, legend, legendItem, tooltip, axis, grid). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const DEFAULT_COLORS = [
  "var(--sn-chart-1, #2563eb)",
  "var(--sn-chart-2, #14b8a6)",
  "var(--sn-chart-3, #f97316)",
  "var(--sn-chart-4, #f59e0b)",
  "var(--sn-chart-5, #ef4444)",
];

const USD_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function getSeriesColor(color: string | undefined, index: number): string {
  return color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]!;
}

function shouldFormatAsCurrency(divisor: number | undefined): boolean {
  return divisor === 100;
}

function formatNumericValue(
  value: number,
  options?: { divisor?: number },
): string | number {
  if (shouldFormatAsCurrency(options?.divisor)) {
    return USD_FORMATTER.format(value);
  }
  return Number.isInteger(value) ? value : Number(value.toFixed(2));
}

function formatChartValue(
  value: unknown,
  options?: { divisor?: number },
): string | number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return formatNumericValue(value, options);
  }
  if (typeof value === "string") {
    const numericValue = Number(value);
    if (Number.isFinite(numericValue) && value.trim() !== "") {
      return formatNumericValue(numericValue, options);
    }
    return value;
  }
  return "";
}

function getSeriesLabel(label: string | undefined): string {
  return typeof label === "string" ? label : "Series";
}

function getResponsiveContainerProps(height?: number | string) {
  return {
    width: "100%" as const,
    height: "100%" as const,
    minWidth: 0,
    minHeight:
      typeof height === "number" && Number.isFinite(height) ? height : 1,
  };
}

function ChartFrame({
  height,
  children,
}: {
  height?: number | string;
  children: ReactElement;
}) {
  if (typeof window === "undefined") {
    return cloneElement(children as ReactElement<Record<string, unknown>>, {
      width: 800,
      height:
        typeof height === "number" && Number.isFinite(height) ? height : 300,
    });
  }

  return (
    <ResponsiveContainer {...getResponsiveContainerProps(height)}>
      {children}
    </ResponsiveContainer>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone Chart — renders data-driven charts via recharts.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <ChartBase
 *   chartType="bar"
 *   data={[{ month: "Jan", revenue: 4000 }, { month: "Feb", revenue: 5200 }]}
 *   xKey="month"
 *   series={[{ key: "revenue", label: "Revenue", color: "#2563eb" }]}
 *   height={300}
 *   legend
 * />
 * ```
 */
export function ChartBase({
  id,
  chartType,
  data: rows,
  xKey,
  series,
  height,
  aspectRatio,
  grid: showGrid,
  legend: showLegend,
  isLoading = false,
  error,
  emptyMessage = "No data",
  hideWhenEmpty = false,
  hasNewData = false,
  onRefresh,
  onPointClick,
  loadingContent,
  className,
  style,
  slots,
}: ChartBaseProps) {
  const rootId = id ?? "chart";

  const seriesConfigByKey = useMemo(
    () => new Map(series.map((s) => [s.key, s] as const)),
    [series],
  );
  const yAxisDivisor = useMemo(() => {
    const divisors = [
      ...new Set(
        series
          .map((s) => s.divisor)
          .filter((d): d is number => typeof d === "number" && d > 0),
      ),
    ];
    return divisors.length === 1 ? divisors[0] : undefined;
  }, [series]);

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      backgroundColor: "var(--sn-color-card, #ffffff)",
      borderRadius: "var(--sn-radius-md, 6px)",
      border:
        "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      padding: "var(--sn-spacing-md, 12px)",
    } as Record<string, unknown>,
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const legendSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-legend`,
    componentSurface: slots?.legend,
  });
  const legendItemSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-legend-item`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--sn-spacing-xs, 0.25rem)",
    },
    componentSurface: slots?.legendItem,
  });
  const tooltipSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-tooltip`,
    implementationBase: {
      backgroundColor: "var(--sn-color-card, #ffffff)",
      border:
        "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      borderRadius: "var(--sn-radius-md, 6px)",
      fontSize: "var(--sn-font-size-sm, 0.875rem)",
      padding: "var(--sn-spacing-sm, 0.5rem)",
    } as Record<string, unknown>,
    componentSurface: slots?.tooltip,
  });
  const axisSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-axis`,
    implementationBase: {
      fontSize: "var(--sn-font-size-xs, 0.75rem)",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    } as Record<string, unknown>,
    componentSurface: slots?.axis,
  });
  const gridSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-grid`,
    implementationBase: {
      color: "var(--sn-color-border, #e5e7eb)",
    } as Record<string, unknown>,
    componentSurface: slots?.grid,
  });

  const chartClick = (
    payload: Record<string, unknown>,
    seriesKey?: string,
  ) => {
    onPointClick?.(payload, seriesKey);
  };

  const axisStyle = {
    fontSize: axisSurface.style?.fontSize as unknown as number,
    fill: String(
      axisSurface.style?.color ?? "var(--sn-color-muted-foreground, #6b7280)",
    ),
  };
  const gridStyle = {
    stroke: String(
      gridSurface.style?.color ?? "var(--sn-color-border, #e5e7eb)",
    ),
    strokeDasharray: "4 4",
  };

  const tooltipRenderer = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: ReadonlyArray<{
      name?: string;
      value?: unknown;
      color?: string;
      dataKey?: string | number;
    }>;
    label?: string | number;
  }) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        data-snapshot-id={`${rootId}-tooltip`}
        className={tooltipSurface.className}
        style={tooltipSurface.style}
      >
        {label !== undefined ? <div>{String(label)}</div> : null}
        {payload.map((entry, index) => (
          <div key={`${entry.name ?? "series"}-${index}`}>
            <span style={{ color: entry.color }}>
              {entry.name ?? "Series"}:
            </span>{" "}
            <span>
              {String(
                formatChartValue(
                  entry.value,
                  typeof entry.dataKey === "string"
                    ? { divisor: seriesConfigByKey.get(entry.dataKey)?.divisor }
                    : undefined,
                ),
              )}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const legendRenderer = ({
    payload,
  }: {
    payload?: ReadonlyArray<{ value?: string; color?: string }>;
  }) => {
    if (!payload?.length) return null;
    return (
      <div
        data-snapshot-id={`${rootId}-legend`}
        className={legendSurface.className}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--sn-spacing-sm, 0.5rem)",
          justifyContent: "center",
          ...legendSurface.style,
        }}
      >
        {payload.map((entry, index) => (
          <div
            key={`${entry.value ?? "series"}-${index}`}
            data-snapshot-id={`${rootId}-legend-item-${index}`}
            className={legendItemSurface.className}
            style={legendItemSurface.style}
          >
            <span
              aria-hidden="true"
              style={{
                width: "0.75rem",
                height: "0.75rem",
                borderRadius: "9999px",
                backgroundColor: entry.color,
              }}
            />
            <span>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const slotStyles = (
    <>
      <SurfaceStyles css={legendSurface.scopedCss} />
      <SurfaceStyles css={legendItemSurface.scopedCss} />
      <SurfaceStyles css={tooltipSurface.scopedCss} />
      <SurfaceStyles css={axisSurface.scopedCss} />
      <SurfaceStyles css={gridSurface.scopedCss} />
    </>
  );

  const tooltipContent = tooltipRenderer as never;
  const legendContent = legendRenderer as never;

  if (!isLoading && !error && rows.length === 0 && hideWhenEmpty) {
    return null;
  }

  // ── Chart rendering ─────────────────────────────────────────────────────

  function renderChart() {
    if (chartType === "pie" || chartType === "donut") {
      const pieData = rows.map((row, index) => ({
        ...row,
        name: String(row[xKey] ?? `Item ${index + 1}`),
        value: Number(row[series[0]?.key ?? "value"] ?? 0),
        fill: getSeriesColor(series[0]?.color, index),
      }));

      return (
        <>
          <ChartFrame height={height}>
            <PieChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={chartType === "donut" ? "55%" : "0%"}
                outerRadius="70%"
                dataKey="value"
                nameKey="name"
                paddingAngle={chartType === "donut" ? 3 : 0}
                onClick={(entry) =>
                  chartClick(entry as unknown as Record<string, unknown>)
                }
              >
                {pieData.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={tooltipContent} />
              {showLegend ? <Legend content={legendContent} /> : null}
            </PieChart>
          </ChartFrame>
          {slotStyles}
        </>
      );
    }

    if (chartType === "radar") {
      return (
        <>
          <ChartFrame height={height}>
            <RadarChart data={rows}>
              <PolarGrid />
              <PolarAngleAxis dataKey={xKey} />
              <PolarRadiusAxis />
              <Tooltip content={tooltipContent} />
              {showLegend ? <Legend content={legendContent} /> : null}
              {series.map((s, index) => (
                <Radar
                  key={s.key}
                  name={getSeriesLabel(s.label)}
                  dataKey={s.key}
                  stroke={getSeriesColor(s.color, index)}
                  fill={getSeriesColor(s.color, index)}
                  fillOpacity={0.25}
                  onClick={(entry) =>
                    chartClick(
                      entry as unknown as Record<string, unknown>,
                      s.key,
                    )
                  }
                />
              ))}
            </RadarChart>
          </ChartFrame>
          {slotStyles}
        </>
      );
    }

    if (chartType === "scatter") {
      return (
        <>
          <ChartFrame height={height}>
            <ScatterChart margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              {showGrid ? <CartesianGrid {...gridStyle} /> : null}
              <XAxis
                dataKey={xKey}
                type="number"
                name={xKey}
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey={series[0]?.key}
                type="number"
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
                width={40}
                tickFormatter={(value) =>
                  String(formatChartValue(value, { divisor: yAxisDivisor }))
                }
              />
              {series[1]?.key ? (
                <ZAxis dataKey={series[1].key} range={[50, 400]} />
              ) : null}
              <Tooltip
                content={tooltipContent}
                cursor={{ strokeDasharray: "4 4" }}
              />
              {showLegend ? <Legend content={legendContent} /> : null}
              <Scatter
                name={getSeriesLabel(series[0]?.label)}
                data={rows.map((row) => ({
                  ...row,
                  [xKey]: Number(row[xKey] ?? 0),
                  [series[0]?.key ?? "value"]: Number(
                    row[series[0]?.key ?? "value"] ?? 0,
                  ),
                }))}
                fill={getSeriesColor(series[0]?.color, 0)}
                onClick={(entry) =>
                  chartClick(
                    entry as unknown as Record<string, unknown>,
                    series[0]?.key,
                  )
                }
              />
            </ScatterChart>
          </ChartFrame>
          {slotStyles}
        </>
      );
    }

    if (chartType === "treemap") {
      const dataKey = series[0]?.key ?? "value";
      return (
        <>
          <ChartFrame height={height}>
            <Treemap
              data={rows}
              dataKey={dataKey}
              aspectRatio={4 / 3}
              stroke="var(--sn-color-background, #ffffff)"
              fill={getSeriesColor(series[0]?.color, 0)}
              onClick={(entry) =>
                chartClick(entry as unknown as Record<string, unknown>, dataKey)
              }
            />
          </ChartFrame>
          {slotStyles}
        </>
      );
    }

    if (chartType === "funnel") {
      const dataKey = series[0]?.key ?? "value";
      return (
        <>
          <ChartFrame height={height}>
            <FunnelChart>
              <Tooltip content={tooltipContent} />
              <Funnel
                dataKey={dataKey}
                data={rows}
                isAnimationActive={false}
                onClick={(entry) =>
                  chartClick(
                    entry as unknown as Record<string, unknown>,
                    dataKey,
                  )
                }
              >
                {rows.map((row, index) => (
                  <Cell
                    key={`${String(row[xKey] ?? index)}`}
                    fill={getSeriesColor(undefined, index)}
                  />
                ))}
              </Funnel>
            </FunnelChart>
          </ChartFrame>
          {slotStyles}
        </>
      );
    }

    // Line, bar, area, sparkline
    const isSparkline = chartType === "sparkline";
    const ChartWrapper =
      chartType === "bar"
        ? BarChart
        : chartType === "area"
          ? AreaChart
          : LineChart;

    return (
      <>
        <ChartFrame height={height}>
          <ChartWrapper
            data={rows}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            {!isSparkline && showGrid ? (
              <CartesianGrid {...gridStyle} />
            ) : null}
            {!isSparkline ? (
              <>
                <XAxis
                  dataKey={xKey}
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  tickFormatter={(value) =>
                    String(formatChartValue(value, { divisor: yAxisDivisor }))
                  }
                />
              </>
            ) : null}
            <Tooltip
              content={tooltipContent}
              formatter={(value, _name, item) =>
                formatChartValue(value, {
                  divisor:
                    typeof item?.dataKey === "string"
                      ? seriesConfigByKey.get(item.dataKey)?.divisor
                      : undefined,
                })
              }
            />
            {showLegend && !isSparkline ? (
              <Legend content={legendContent} />
            ) : null}
            {series.map((s, index) => {
              const color = getSeriesColor(s.color, index);
              if (chartType === "bar") {
                return (
                  <Bar
                    key={s.key}
                    dataKey={s.key}
                    name={getSeriesLabel(s.label)}
                    fill={color}
                    radius={4}
                    onClick={(entry) =>
                      chartClick(
                        entry as unknown as Record<string, unknown>,
                        s.key,
                      )
                    }
                  />
                );
              }
              if (chartType === "area") {
                return (
                  <Area
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={getSeriesLabel(s.label)}
                    stroke={color}
                    fill={color}
                    fillOpacity={0.2}
                    strokeWidth={2}
                    onClick={(entry) =>
                      chartClick(
                        entry as unknown as Record<string, unknown>,
                        s.key,
                      )
                    }
                  />
                );
              }
              return (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={getSeriesLabel(s.label)}
                  stroke={color}
                  strokeWidth={isSparkline ? 3 : 2}
                  dot={false}
                  onClick={(entry) =>
                    chartClick(
                      entry as unknown as Record<string, unknown>,
                      s.key,
                    )
                  }
                />
              );
            })}
          </ChartWrapper>
        </ChartFrame>
        {slotStyles}
      </>
    );
  }

  return (
    <div
      data-snapshot-component="chart"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {hasNewData ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "var(--sn-spacing-sm, 8px)",
            marginBottom: "var(--sn-spacing-sm, 8px)",
            padding: "var(--sn-spacing-sm, 8px) var(--sn-spacing-md, 12px)",
            borderRadius: "var(--sn-radius-md, 6px)",
            backgroundColor: "var(--sn-color-secondary, #f3f4f6)",
          }}
        >
          <span>New data available</span>
          <ButtonControl variant="outline" onClick={onRefresh}>
            Refresh
          </ButtonControl>
        </div>
      ) : null}

      <div
        style={{
          height,
          aspectRatio,
        }}
      >
        {isLoading ? (
          loadingContent ?? (
            <div
              data-chart-loading=""
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--sn-color-muted-foreground, #6b7280)",
                fontSize: "var(--sn-font-size-sm, 0.875rem)",
              }}
            >
              Loading...
            </div>
          )
        ) : null}

        {error ? (
          <div
            data-chart-error=""
            role="alert"
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--sn-color-destructive, #dc2626)",
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
            }}
          >
            Error: {error}
          </div>
        ) : null}

        {!isLoading && !error && rows.length === 0 ? (
          <div
            data-chart-empty=""
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--sn-color-muted-foreground, #6b7280)",
              fontSize: "var(--sn-font-size-md, 1rem)",
            }}
          >
            {emptyMessage}
          </div>
        ) : null}

        {!isLoading && !error && rows.length > 0 ? (
          <div data-chart-content="" style={{ width: "100%", height: "100%" }}>
            {renderChart()}
          </div>
        ) : null}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
    </div>
  );
}
