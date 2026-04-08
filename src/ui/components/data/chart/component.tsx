import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useComponentData } from "../../_base/use-component-data";
import { useSubscribe } from "../../../context/hooks";
import { usePublish } from "../../../context/hooks";
import { isFromRef } from "../../../context/utils";
import type { ChartConfig } from "./types";

// ── Default chart colors (map to token CSS variables) ────────────────────────

const DEFAULT_COLORS = [
  "var(--sn-chart-1, oklch(0.646 0.222 41.116))",
  "var(--sn-chart-2, oklch(0.6 0.118 184.704))",
  "var(--sn-chart-3, oklch(0.398 0.07 227.392))",
  "var(--sn-chart-4, oklch(0.828 0.189 84.429))",
  "var(--sn-chart-5, oklch(0.769 0.188 70.08))",
];

function getSeriesColor(color: string | undefined, index: number): string {
  if (color) return color;
  return DEFAULT_COLORS[index % DEFAULT_COLORS.length]!;
}

// ── Data normalization ────────────────────────────────────────────────────────

function normalizeRows(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];
  if (raw != null && typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    if (Array.isArray(r["data"])) return r["data"] as Record<string, unknown>[];
    if (Array.isArray(r["items"]))
      return r["items"] as Record<string, unknown>[];
  }
  return [];
}

// ── Pie / Donut data shape ────────────────────────────────────────────────────

interface PieEntry {
  name: string;
  value: number;
  fill: string;
}

function buildPieData(
  rows: Record<string, unknown>[],
  config: ChartConfig,
): PieEntry[] {
  return rows.map((row, i) => {
    const seriesCfg = config.series[0];
    const value = seriesCfg ? Number(row[seriesCfg.key] ?? 0) : 0;
    const name = String(row[config.xKey] ?? `Item ${i + 1}`);
    return {
      name,
      value,
      fill: getSeriesColor(seriesCfg?.color, i),
    };
  });
}

// ── Cartesian chart renderer ──────────────────────────────────────────────────

function CartesianChart({
  rows,
  config,
}: {
  rows: Record<string, unknown>[];
  config: ChartConfig;
}) {
  const commonProps = {
    data: rows,
    margin: { top: 8, right: 8, left: 0, bottom: 0 },
  };

  const axisStyle = {
    fontSize: "var(--sn-font-size-xs, 0.75rem)" as unknown as number,
    fill: "var(--sn-color-muted-foreground, #6b7280)",
  };

  const gridStyle = {
    stroke: "var(--sn-color-border, #e5e7eb)",
    strokeDasharray: "4 4",
  };

  const seriesElements = config.series.map((s, i) => {
    const color = getSeriesColor(s.color, i);
    switch (config.chartType) {
      case "bar":
        return (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            fill={color}
            radius={4}
          />
        );
      case "area":
        return (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={color}
            fill={color}
            fillOpacity={0.2}
            strokeWidth={2}
          />
        );
      default:
        // line
        return (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        );
    }
  });

  const inner = (
    <>
      {config.grid && <CartesianGrid {...gridStyle} />}
      <XAxis
        dataKey={config.xKey}
        tick={axisStyle}
        axisLine={false}
        tickLine={false}
      />
      <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={40} />
      <Tooltip
        contentStyle={{
          backgroundColor: "var(--sn-color-card, #fff)",
          border:
            "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
          borderRadius: "var(--sn-radius-md, 6px)",
          fontSize: "var(--sn-font-size-sm, 0.875rem)",
        }}
      />
      {config.legend && <Legend />}
      {seriesElements}
    </>
  );

  const ChartWrapper =
    config.chartType === "bar"
      ? BarChart
      : config.chartType === "area"
        ? AreaChart
        : LineChart;

  return (
    <ResponsiveContainer width="100%" height={config.height}>
      <ChartWrapper {...commonProps}>{inner}</ChartWrapper>
    </ResponsiveContainer>
  );
}

// ── Pie / Donut chart renderer ────────────────────────────────────────────────

function PieDonutChart({
  rows,
  config,
}: {
  rows: Record<string, unknown>[];
  config: ChartConfig;
}) {
  const pieData = useMemo(() => buildPieData(rows, config), [rows, config]);
  const innerRadius = config.chartType === "donut" ? "55%" : "0%";

  return (
    <ResponsiveContainer width="100%" height={config.height}>
      <PieChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius="70%"
          dataKey="value"
          nameKey="name"
          paddingAngle={config.chartType === "donut" ? 3 : 0}
        >
          {pieData.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--sn-color-card, #fff)",
            border:
              "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
            borderRadius: "var(--sn-radius-md, 6px)",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
          }}
        />
        {config.legend && <Legend />}
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * Config-driven Chart component.
 *
 * Renders a data visualization (bar, line, area, pie, donut) using Recharts.
 * Data comes from an endpoint or from-ref. Colors default to `--sn-chart-*`
 * design tokens. Handles loading, error, and empty states.
 *
 * @param props.config - Chart configuration from the Zod schema
 *
 * @example
 * ```tsx
 * <Chart config={{
 *   data: 'GET /api/stats/monthly',
 *   type: 'bar',
 *   xKey: 'month',
 *   series: [{ key: 'revenue', label: 'Revenue' }],
 *   height: 300,
 * }} />
 * ```
 */
export function Chart({ config }: { config: ChartConfig }) {
  const publish = usePublish(config.id);

  const isRef = isFromRef(config.data);
  const resolvedRef = useSubscribe(config.data);
  const { data: fetchedData, isLoading, error } = useComponentData(config.data);

  const rows = useMemo<Record<string, unknown>[]>(() => {
    if (isRef) return normalizeRows(resolvedRef);
    return normalizeRows(fetchedData);
  }, [isRef, resolvedRef, fetchedData]);

  const loading = !isRef && isLoading;
  const fetchError = !isRef ? error : null;

  return (
    <div
      data-snapshot-component="chart"
      className={config.className}
      style={{
        backgroundColor: "var(--sn-color-card, #fff)",
        borderRadius: "var(--sn-radius-md, 6px)",
        border:
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
        padding: "var(--sn-spacing-md, 12px)",
        ...(config.style as React.CSSProperties),
      }}
    >
      {/* Loading */}
      {loading && (
        <div
          data-chart-loading
          style={{
            height: config.height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--sn-color-muted-foreground, #6b7280)",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
          }}
        >
          Loading…
        </div>
      )}

      {/* Error */}
      {fetchError && (
        <div
          data-chart-error
          role="alert"
          style={{
            height: config.height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--sn-color-destructive, oklch(0.577 0.245 27.325))",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
          }}
        >
          Error: {fetchError.message}
        </div>
      )}

      {/* Empty */}
      {!loading && !fetchError && rows.length === 0 && (
        <div
          data-chart-empty
          style={{
            height: config.height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--sn-color-muted-foreground, #6b7280)",
            fontSize: "var(--sn-font-size-md, 1rem)",
          }}
        >
          {config.emptyMessage}
        </div>
      )}

      {/* Chart */}
      {!loading && !fetchError && rows.length > 0 && (
        <div data-chart-content>
          {config.chartType === "pie" || config.chartType === "donut" ? (
            <PieDonutChart rows={rows} config={config} />
          ) : (
            <CartesianChart rows={rows} config={config} />
          )}
        </div>
      )}
    </div>
  );
}
