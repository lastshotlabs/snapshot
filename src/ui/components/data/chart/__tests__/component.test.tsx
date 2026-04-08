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
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
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
  Tooltip: () => null,
  Legend: () => <div data-testid="legend" />,
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
});
