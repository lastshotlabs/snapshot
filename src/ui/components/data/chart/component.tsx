"use client";

import { useMemo } from "react";
import { useAtomValue } from "jotai/react";
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
import { useActionExecutor } from "../../../actions/executor";
import { useSubscribe } from "../../../context/hooks";
import { isFromRef } from "../../../context/utils";
import { wsManagerAtom } from "../../../../ws/atom";
import { AutoEmptyState } from "../../_base/auto-empty-state";
import type { AutoEmptyStateConfig } from "../../_base/auto-empty-state";
import { AutoSkeleton } from "../../_base/auto-skeleton";
import { useComponentData } from "../../_base/use-component-data";
import { useLiveData } from "../../_base/use-live-data";
import { SurfaceStyles } from "../../_base/surface-styles";
import { ButtonControl } from "../../forms/button";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { ChartConfig } from "./types";
import {
  normalizeMetricRows,
  projectMetricRows,
} from "../_shared/metric-fields";

const DEFAULT_COLORS = [
  "var(--sn-chart-1, #2563eb)",
  "var(--sn-chart-2, #14b8a6)",
  "var(--sn-chart-3, #f97316)",
  "var(--sn-chart-4, #f59e0b)",
  "var(--sn-chart-5, #ef4444)",
];

function getSeriesColor(color: string | undefined, index: number): string {
  return color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]!;
}

function formatChartValue(value: unknown): string | number {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    return value;
  }
  return "";
}

function toAutoEmptyStateConfig(
  empty: ChartConfig["empty"],
): AutoEmptyStateConfig | null {
  if (!empty) {
    return null;
  }

  return {
    icon: empty.icon,
    title: empty.title,
    description: empty.description,
    ...(empty.action?.action
      ? {
          action: {
            label: empty.action.label,
            action: empty.action.action,
            icon: empty.action.icon,
            variant: empty.action.variant,
          },
        }
      : {}),
  };
}

function ChartSurface({
  config,
  rows,
  rootId,
}: {
  config: ChartConfig;
  rows: Record<string, unknown>[];
  rootId: string;
}) {
  const execute = useActionExecutor();
  const legendSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-legend`,
    componentSurface: config.slots?.legend,
  });
  const legendItemSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-legend-item`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--sn-spacing-xs, 0.25rem)",
    },
    componentSurface: config.slots?.legendItem,
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
    componentSurface: config.slots?.tooltip,
  });
  const axisSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-axis`,
    implementationBase: {
      fontSize: "var(--sn-font-size-xs, 0.75rem)",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    } as Record<string, unknown>,
    componentSurface: config.slots?.axis,
  });
  const gridSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-grid`,
    implementationBase: {
      color: "var(--sn-color-border, #e5e7eb)",
    } as Record<string, unknown>,
    componentSurface: config.slots?.grid,
  });

  const chartClick = (payload: Record<string, unknown>, seriesKey?: string) => {
    if (!config.onClick) {
      return;
    }

    void execute(config.onClick, {
      point: payload,
      item: payload,
      seriesKey,
    });
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
    payload?: ReadonlyArray<{ name?: string; value?: unknown; color?: string }>;
    label?: string | number;
  }) => {
    if (!active || !payload?.length) {
      return null;
    }

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
            <span>{String(entry.value ?? "")}</span>
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
    if (!payload?.length) {
      return null;
    }

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

  if (config.chartType === "pie" || config.chartType === "donut") {
    const pieData = rows.map((row, index) => ({
      ...row,
      name: String(row[config.xKey] ?? `Item ${index + 1}`),
      value: Number(row[config.series[0]?.key ?? "value"] ?? 0),
      fill: getSeriesColor(config.series[0]?.color, index),
    }));

    return (
      <>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={config.chartType === "donut" ? "55%" : "0%"}
              outerRadius="70%"
              dataKey="value"
              nameKey="name"
              paddingAngle={config.chartType === "donut" ? 3 : 0}
              onClick={(entry) =>
                chartClick(entry as unknown as Record<string, unknown>)
              }
            >
              {pieData.map((entry, index) => (
                <Cell key={`${entry.name}-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={tooltipContent} />
            {config.legend ? <Legend content={legendContent} /> : null}
          </PieChart>
        </ResponsiveContainer>
        {slotStyles}
      </>
    );
  }

  if (config.chartType === "radar") {
    return (
      <>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={rows}>
            <PolarGrid />
            <PolarAngleAxis dataKey={config.xKey} />
            <PolarRadiusAxis />
            <Tooltip content={tooltipContent} />
            {config.legend ? <Legend content={legendContent} /> : null}
            {config.series.map(
              (series: ChartConfig["series"][number], index: number) => (
                <Radar
                  key={series.key}
                  name={series.label}
                  dataKey={series.key}
                  stroke={getSeriesColor(series.color, index)}
                  fill={getSeriesColor(series.color, index)}
                  fillOpacity={0.25}
                  onClick={(entry) =>
                    chartClick(
                      entry as unknown as Record<string, unknown>,
                      series.key,
                    )
                  }
                />
              ),
            )}
          </RadarChart>
        </ResponsiveContainer>
        {slotStyles}
      </>
    );
  }

  if (config.chartType === "scatter") {
    return (
      <>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            {config.grid ? <CartesianGrid {...gridStyle} /> : null}
            <XAxis
              dataKey={config.xKey}
              type="number"
              name={config.xKey}
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              dataKey={config.series[0]?.key}
              type="number"
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            {config.series[1]?.key ? (
              <ZAxis dataKey={config.series[1].key} range={[50, 400]} />
            ) : null}
            <Tooltip
              content={tooltipContent}
              cursor={{ strokeDasharray: "4 4" }}
            />
            {config.legend ? <Legend content={legendContent} /> : null}
            <Scatter
              name={config.series[0]?.label ?? "Series"}
              data={rows.map((row) => ({
                ...row,
                [config.xKey]: Number(row[config.xKey] ?? 0),
                [config.series[0]?.key ?? "value"]: Number(
                  row[config.series[0]?.key ?? "value"] ?? 0,
                ),
              }))}
              fill={getSeriesColor(config.series[0]?.color, 0)}
              onClick={(entry) =>
                chartClick(
                  entry as unknown as Record<string, unknown>,
                  config.series[0]?.key,
                )
              }
            />
          </ScatterChart>
        </ResponsiveContainer>
        {slotStyles}
      </>
    );
  }

  if (config.chartType === "treemap") {
    const dataKey = config.series[0]?.key ?? "value";
    return (
      <>
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={rows}
            dataKey={dataKey}
            aspectRatio={4 / 3}
            stroke="var(--sn-color-background, #ffffff)"
            fill={getSeriesColor(config.series[0]?.color, 0)}
            onClick={(entry) =>
              chartClick(entry as unknown as Record<string, unknown>, dataKey)
            }
          />
        </ResponsiveContainer>
        {slotStyles}
      </>
    );
  }

  if (config.chartType === "funnel") {
    const dataKey = config.series[0]?.key ?? "value";
    return (
      <>
        <ResponsiveContainer width="100%" height="100%">
          <FunnelChart>
            <Tooltip content={tooltipContent} />
            <Funnel
              dataKey={dataKey}
              data={rows}
              isAnimationActive={false}
              onClick={(entry) =>
                chartClick(entry as unknown as Record<string, unknown>, dataKey)
              }
            >
              {rows.map((row, index) => (
                <Cell
                  key={`${String(row[config.xKey] ?? index)}`}
                  fill={getSeriesColor(undefined, index)}
                />
              ))}
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
        {slotStyles}
      </>
    );
  }

  const isSparkline = config.chartType === "sparkline";
  const ChartWrapper =
    config.chartType === "bar"
      ? BarChart
      : config.chartType === "area"
        ? AreaChart
        : LineChart;

  return (
    <>
      <ResponsiveContainer width="100%" height="100%">
        <ChartWrapper
          data={rows}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          {!isSparkline && config.grid ? (
            <CartesianGrid {...gridStyle} />
          ) : null}
          {!isSparkline ? (
            <>
              <XAxis
                dataKey={config.xKey}
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
                width={40}
              />
            </>
          ) : null}
          <Tooltip content={tooltipContent} formatter={formatChartValue} />
          {config.legend && !isSparkline ? (
            <Legend content={legendContent} />
          ) : null}
          {config.series.map(
            (series: ChartConfig["series"][number], index: number) => {
              const color = getSeriesColor(series.color, index);
              if (config.chartType === "bar") {
                return (
                  <Bar
                    key={series.key}
                    dataKey={series.key}
                    name={series.label}
                    fill={color}
                    radius={4}
                    onClick={(entry) =>
                      chartClick(
                        entry as unknown as Record<string, unknown>,
                        series.key,
                      )
                    }
                  />
                );
              }
              if (config.chartType === "area") {
                return (
                  <Area
                    key={series.key}
                    type="monotone"
                    dataKey={series.key}
                    name={series.label}
                    stroke={color}
                    fill={color}
                    fillOpacity={0.2}
                    strokeWidth={2}
                    onClick={(entry) =>
                      chartClick(
                        entry as unknown as Record<string, unknown>,
                        series.key,
                      )
                    }
                  />
                );
              }
              return (
                <Line
                  key={series.key}
                  type="monotone"
                  dataKey={series.key}
                  name={series.label}
                  stroke={color}
                  strokeWidth={isSparkline ? 3 : 2}
                  dot={false}
                  onClick={(entry) =>
                    chartClick(
                      entry as unknown as Record<string, unknown>,
                      series.key,
                    )
                  }
                />
              );
            },
          )}
        </ChartWrapper>
      </ResponsiveContainer>
      {slotStyles}
    </>
  );
}

/**
 * Render a config-driven chart with manifest data sources, live refresh, and slot-aware styling.
 */
export function Chart({ config }: { config: ChartConfig }) {
  const wsManager = useAtomValue(wsManagerAtom);
  const isRef = isFromRef(config.data);
  const resolvedRef = useSubscribe(config.data);
  const {
    data: fetchedData,
    isLoading,
    error,
    refetch,
  } = useComponentData(config.data, undefined, { poll: config.poll });

  const rows = useMemo<Record<string, unknown>[]>(() => {
    if (isRef) {
      return normalizeMetricRows(resolvedRef);
    }
    return normalizeMetricRows(fetchedData);
  }, [fetchedData, isRef, resolvedRef]);
  const chartRows = useMemo<Record<string, unknown>[]>(() => {
    return projectMetricRows(
      rows,
      config.series.map((series) => series.key),
    );
  }, [config.series, rows]);

  const liveConfig = useMemo(
    () =>
      config.live === true
        ? { event: "*", indicator: false, debounce: undefined }
        : config.live
          ? {
              event: config.live.event,
              indicator: config.live.indicator,
              debounce: config.live.debounce,
            }
          : null,
    [config.live],
  );
  const { hasNewData, refresh } = useLiveData({
    event: liveConfig?.event ?? "*",
    onRefresh: refetch,
    debounce: liveConfig?.debounce,
    indicator: liveConfig?.indicator,
    wsManager,
    enabled: liveConfig !== null,
  });
  const emptyStateConfig = useMemo(
    () => toAutoEmptyStateConfig(config.empty),
    [config.empty],
  );
  const rootId = config.id ?? "chart";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      backgroundColor: "var(--sn-color-card, #ffffff)",
      borderRadius: "var(--sn-radius-md, 6px)",
      border:
        "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      padding: "var(--sn-spacing-md, 12px)",
    } as Record<string, unknown>,
    componentSurface: config,
    itemSurface: config.slots?.root,
  });

  const loading = !isRef && isLoading;
  const fetchError = !isRef ? error : null;

  if (!loading && !fetchError && chartRows.length === 0 && config.hideWhenEmpty) {
    return null;
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
          <ButtonControl variant="outline" onClick={refresh}>
            Refresh
          </ButtonControl>
        </div>
      ) : null}

      <div
        style={{
          height: config.height,
          aspectRatio: config.aspectRatio,
        }}
      >
        {loading ? (
          config.loading && !config.loading.disabled ? (
            <AutoSkeleton componentType="chart" config={config.loading} />
          ) : (
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

        {fetchError ? (
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
            Error: {fetchError.message}
          </div>
        ) : null}

        {!loading && !fetchError && chartRows.length === 0 ? (
          emptyStateConfig ? (
            <AutoEmptyState config={emptyStateConfig} />
          ) : (
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
              {config.emptyMessage}
            </div>
          )
        ) : null}

        {!loading && !fetchError && chartRows.length > 0 ? (
          <div data-chart-content="" style={{ width: "100%", height: "100%" }}>
            <ChartSurface config={config} rows={chartRows} rootId={rootId} />
          </div>
        ) : null}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
    </div>
  );
}
