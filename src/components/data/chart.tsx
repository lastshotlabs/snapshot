import { useMemo } from "react";
import type { ApiClient } from "../../api/client";
import { token } from "../../tokens/utils";
import { useDataSource } from "../data-binding";
import type { ChartConfig } from "./chart.schema";

interface ChartProps {
  config: ChartConfig;
  api: ApiClient;
  id?: string;
}

/**
 * Config-driven chart component.
 *
 * Renders a simple SVG-based chart (line, bar, pie, area, donut).
 * For production use, swap this registration with a wrapper around
 * your preferred charting library (Recharts, Chart.js, etc.) via
 * registry.extend().
 *
 * This built-in implementation covers basic visualization needs
 * without adding a charting dependency.
 */
export function Chart({ config, api }: ChartProps) {
  const { data, isLoading, isError } = useDataSource(api, {
    source: config.data,
  });

  const items = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data as Record<string, unknown>[];
    if (typeof data === "object" && "data" in (data as Record<string, unknown>)) {
      return (data as Record<string, unknown>).data as Record<string, unknown>[];
    }
    return [];
  }, [data]);

  const height =
    typeof config.height === "number" ? `${config.height}px` : (config.height ?? "300px");

  if (isLoading) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: token("colors.muted-foreground"),
        }}
      >
        Loading chart...
      </div>
    );
  }

  if (isError || items.length === 0) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: token("colors.muted-foreground"),
        }}
      >
        {config.emptyState ?? "No data to display"}
      </div>
    );
  }

  return (
    <div className={config.className}>
      {config.title && (
        <div
          style={{
            fontSize: token("typography.fontSize.sm"),
            fontWeight: token("typography.fontWeight.medium"),
            color: token("colors.foreground"),
            marginBottom: token("spacing.3"),
          }}
        >
          {config.title}
        </div>
      )}

      {config.variant === "bar" && <BarChart config={config} items={items} height={height} />}
      {config.variant === "line" && <LineChart config={config} items={items} height={height} />}
      {config.variant === "area" && (
        <LineChart config={config} items={items} height={height} fill />
      )}
      {(config.variant === "pie" || config.variant === "donut") && (
        <PieChart
          config={config}
          items={items}
          height={height}
          donut={config.variant === "donut"}
        />
      )}
    </div>
  );
}

// ── Simple SVG bar chart ─────────────────────────────────────────────────────

function BarChart({
  config,
  items,
  height,
}: {
  config: ChartConfig;
  items: Record<string, unknown>[];
  height: string;
}) {
  const xField = config.xField ?? config.labelField ?? "label";
  const yField = config.yField ?? config.valueField ?? "value";
  const values = items.map((item) => Number(item[yField]) || 0);
  const maxVal = Math.max(...values, 1);
  const barWidth = Math.max(20, Math.floor(600 / items.length) - 8);

  return (
    <svg
      viewBox={`0 0 ${items.length * (barWidth + 8)} 200`}
      style={{ width: "100%", height, overflow: "visible" }}
    >
      {items.map((item, i) => {
        const val = values[i]!;
        const barHeight = (val / maxVal) * 180;
        const x = i * (barWidth + 8) + 4;
        return (
          <g key={i}>
            <rect
              x={x}
              y={200 - barHeight}
              width={barWidth}
              height={barHeight}
              rx={3}
              fill="var(--color-primary)"
              opacity={0.85}
            />
            <text
              x={x + barWidth / 2}
              y={196}
              textAnchor="middle"
              fontSize="10"
              fill="var(--color-muted-foreground)"
            >
              {String(item[xField] ?? "").slice(0, 8)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Simple SVG line/area chart ───────────────────────────────────────────────

function LineChart({
  config,
  items,
  height,
  fill,
}: {
  config: ChartConfig;
  items: Record<string, unknown>[];
  height: string;
  fill?: boolean;
}) {
  const yField = config.yField ?? config.valueField ?? "value";
  const values = items.map((item) => Number(item[yField]) || 0);
  const maxVal = Math.max(...values, 1);
  const w = 600;
  const h = 200;
  const pad = 10;

  const points = values.map((val, i) => {
    const x = pad + (i / Math.max(values.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - (val / maxVal) * (h - pad * 2);
    return `${x},${y}`;
  });

  const polyline = points.join(" ");
  const areaPath = fill
    ? `M ${pad},${h - pad} L ${polyline.replace(/,/g, " ").split(" ").join(" ")} L ${w - pad},${h - pad} Z`
    : undefined;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height }}>
      {fill && (
        <polygon
          points={`${pad},${h - pad} ${polyline} ${w - pad},${h - pad}`}
          fill="var(--color-primary)"
          opacity={0.15}
        />
      )}
      <polyline
        points={polyline}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {values.map((_, i) => {
        const [x, y] = points[i]!.split(",").map(Number);
        return <circle key={i} cx={x} cy={y} r={3} fill="var(--color-primary)" />;
      })}
    </svg>
  );
}

// ── Simple SVG pie/donut chart ───────────────────────────────────────────────

function PieChart({
  config,
  items,
  height,
  donut,
}: {
  config: ChartConfig;
  items: Record<string, unknown>[];
  height: string;
  donut?: boolean;
}) {
  const valueField = config.valueField ?? "value";
  const labelField = config.labelField ?? "label";
  const values = items.map((item) => Math.max(0, Number(item[valueField]) || 0));
  const total = values.reduce((a, b) => a + b, 0) || 1;

  const colors = [
    "var(--color-primary)",
    "var(--color-secondary)",
    "var(--color-accent)",
    "var(--color-destructive)",
    "var(--color-muted)",
  ];

  const cx = 100;
  const cy = 100;
  const r = 80;
  const innerR = donut ? 50 : 0;

  let startAngle = -Math.PI / 2;

  const slices = values.map((val, i) => {
    const angle = (val / total) * Math.PI * 2;
    const endAngle = startAngle + angle;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);

    const largeArc = angle > Math.PI ? 1 : 0;

    let d: string;
    if (donut) {
      const ix1 = cx + innerR * Math.cos(startAngle);
      const iy1 = cy + innerR * Math.sin(startAngle);
      const ix2 = cx + innerR * Math.cos(endAngle);
      const iy2 = cy + innerR * Math.sin(endAngle);
      d = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
    } else {
      d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    }

    startAngle = endAngle;
    return { d, color: colors[i % colors.length]!, label: String(items[i]![labelField] ?? "") };
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: token("spacing.4") }}>
      <svg viewBox="0 0 200 200" style={{ width: height, height }}>
        {slices.map((slice, i) => (
          <path key={i} d={slice.d} fill={slice.color} opacity={0.85} />
        ))}
      </svg>

      {config.showLegend !== false && (
        <div style={{ display: "flex", flexDirection: "column", gap: token("spacing.1") }}>
          {slices.map((slice, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: token("spacing.2") }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "2px",
                  backgroundColor: slice.color,
                }}
              />
              <span
                style={{
                  fontSize: token("typography.fontSize.xs"),
                  color: token("colors.foreground"),
                }}
              >
                {slice.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
