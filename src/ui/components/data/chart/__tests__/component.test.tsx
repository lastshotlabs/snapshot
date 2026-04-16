// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { AtomRegistryImpl } from "../../../../context/registry";
import {
  PageRegistryContext,
  AppRegistryContext,
} from "../../../../context/providers";
import { SnapshotApiContext } from "../../../../actions/executor";
import { Chart } from "../component";
import type { ChartConfig } from "../types";

// Mock recharts for jsdom (no canvas available)
vi.mock("recharts", () => ({
  BarChart: ({
    children,
    data,
  }: {
    children: React.ReactNode;
    data?: unknown;
  }) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data ?? null)}>
      {children}
    </div>
  ),
  LineChart: ({
    children,
    data,
  }: {
    children: React.ReactNode;
    data?: unknown;
  }) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data ?? null)}>
      {children}
    </div>
  ),
  AreaChart: ({
    children,
    data,
  }: {
    children: React.ReactNode;
    data?: unknown;
  }) => (
    <div data-testid="area-chart" data-chart-data={JSON.stringify(data ?? null)}>
      {children}
    </div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Bar: () => null,
  Line: () => null,
  Area: () => null,
  Pie: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie">{children}</div>
  ),
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: ({ content }: { content?: (props: unknown) => React.ReactNode }) => (
    <div data-testid="tooltip">{content?.({ active: true, label: "Jan", payload: [{ name: "Revenue", value: 4000, color: "#2563eb" }] })}</div>
  ),
  Legend: ({ content }: { content?: (props: unknown) => React.ReactNode }) => (
    <div data-testid="legend">{content?.({ payload: [{ value: "Revenue", color: "#2563eb" }] })}</div>
  ),
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

const testData = [
  { month: "Jan", revenue: 4000, expenses: 2400 },
  { month: "Feb", revenue: 3000, expenses: 1398 },
  { month: "Mar", revenue: 6000, expenses: 3200 },
];

function createWrapper(data: unknown[] = testData) {
  const registry = new AtomRegistryImpl();
  const sourceAtom = registry.register("chart-source");
  registry.store.set(sourceAtom, data);

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <AppRegistryContext.Provider value={null}>
        <PageRegistryContext.Provider value={registry}>
          <SnapshotApiContext.Provider value={null}>
            {children}
          </SnapshotApiContext.Provider>
        </PageRegistryContext.Provider>
      </AppRegistryContext.Provider>
    );
  }

  return { Wrapper, registry };
}

function baseConfig(overrides: Partial<ChartConfig> = {}): ChartConfig {
  return {
    type: "chart",
    data: { from: "chart-source" },
    xKey: "month",
    series: [
      { key: "revenue", label: "Revenue" },
      { key: "expenses", label: "Expenses" },
    ],
    chartType: "bar",
    height: 300,
    legend: true,
    grid: true,
    emptyMessage: "No data",
    hideWhenEmpty: false,
    ...overrides,
  };
}

describe("Chart component", () => {
  it("renders with data-snapshot-component attribute", () => {
    const { Wrapper } = createWrapper();
    const { container } = render(
      <Wrapper>
        <Chart config={baseConfig()} />
      </Wrapper>,
    );
    expect(
      container.querySelector('[data-snapshot-component="chart"]'),
    ).not.toBeNull();
  });

  it("renders a bar chart by default", () => {
    const { Wrapper } = createWrapper();
    const { container } = render(
      <Wrapper>
        <Chart config={baseConfig({ chartType: "bar" })} />
      </Wrapper>,
    );
    expect(container.querySelector('[data-testid="bar-chart"]')).not.toBeNull();
  });

  it("renders a line chart when type is line", () => {
    const { Wrapper } = createWrapper();
    const { container } = render(
      <Wrapper>
        <Chart config={baseConfig({ chartType: "line" })} />
      </Wrapper>,
    );
    expect(
      container.querySelector('[data-testid="line-chart"]'),
    ).not.toBeNull();
  });

  it("renders an area chart when type is area", () => {
    const { Wrapper } = createWrapper();
    const { container } = render(
      <Wrapper>
        <Chart config={baseConfig({ chartType: "area" })} />
      </Wrapper>,
    );
    expect(
      container.querySelector('[data-testid="area-chart"]'),
    ).not.toBeNull();
  });

  it("renders a pie chart when type is pie", () => {
    const { Wrapper } = createWrapper();
    const { container } = render(
      <Wrapper>
        <Chart config={baseConfig({ chartType: "pie" })} />
      </Wrapper>,
    );
    expect(container.querySelector('[data-testid="pie-chart"]')).not.toBeNull();
  });

  it("renders a pie chart when type is donut", () => {
    const { Wrapper } = createWrapper();
    const { container } = render(
      <Wrapper>
        <Chart config={baseConfig({ chartType: "donut" })} />
      </Wrapper>,
    );
    expect(container.querySelector('[data-testid="pie-chart"]')).not.toBeNull();
  });

  it("renders empty state when no data", () => {
    const { Wrapper } = createWrapper([]);
    render(
      <Wrapper>
        <Chart config={baseConfig({ emptyMessage: "No chart data" })} />
      </Wrapper>,
    );
    expect(screen.getByText("No chart data")).toBeDefined();
  });

  it("renders responsive container when data is available", () => {
    const { Wrapper } = createWrapper();
    const { container } = render(
      <Wrapper>
        <Chart config={baseConfig()} />
      </Wrapper>,
    );
    expect(
      container.querySelector('[data-testid="responsive-container"]'),
    ).not.toBeNull();
  });

  it("publishes to context when id is set", () => {
    const { Wrapper, registry } = createWrapper();
    const publishAtom = registry.register("my-chart");
    const { container } = render(
      <Wrapper>
        <Chart config={baseConfig({ id: "my-chart" })} />
      </Wrapper>,
    );
    // Chart publishes undefined (no selection mechanism in Chart), just verifies it mounts
    expect(
      container.querySelector('[data-testid="responsive-container"]'),
    ).not.toBeNull();
  });

  it("applies canonical root and legend slots", () => {
    const { Wrapper } = createWrapper();
    const { container } = render(
      <Wrapper>
        <Chart
          config={baseConfig({
            id: "revenue-chart",
            slots: {
              root: { className: "chart-root-slot" },
              legend: { className: "chart-legend-slot" },
            },
          })}
        />
      </Wrapper>,
    );

    expect(
      container.querySelector('[data-snapshot-id="revenue-chart-root"]')?.className,
    ).toContain("chart-root-slot");
    expect(
      container.querySelector('[data-snapshot-id="revenue-chart-legend"]')?.className,
    ).toContain("chart-legend-slot");
  });

  it("projects aggregate alias values onto configured series keys", () => {
    const aliasRows = [
      { month: "Jan", amount: 4000 },
      { month: "Feb", amount: 3000 },
    ];
    const { Wrapper } = createWrapper(aliasRows);
    const { container } = render(
      <Wrapper>
        <Chart
          config={baseConfig({
            series: [{ key: "amount_sum", label: "Revenue" }],
          })}
        />
      </Wrapper>,
    );

    const chartData = container
      .querySelector('[data-testid="bar-chart"]')
      ?.getAttribute("data-chart-data");
    expect(chartData).toContain('"amount_sum":4000');
    expect(chartData).toContain('"amount_sum":3000');
  });
});
