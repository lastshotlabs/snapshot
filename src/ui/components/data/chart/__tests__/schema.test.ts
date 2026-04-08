import { describe, it, expect } from "vitest";
import { chartSchema } from "../schema";

describe("chartSchema", () => {
  const baseConfig = {
    type: "chart",
    data: "GET /api/stats",
    xKey: "month",
    series: [{ key: "revenue", label: "Revenue" }],
  };

  it("accepts a minimal valid config", () => {
    const result = chartSchema.safeParse(baseConfig);
    expect(result.success).toBe(true);
  });

  it("applies default chartType = 'bar'", () => {
    const result = chartSchema.safeParse(baseConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.chartType).toBe("bar");
    }
  });

  it("applies default height = 300", () => {
    const result = chartSchema.safeParse(baseConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.height).toBe(300);
    }
  });

  it("applies default legend = true", () => {
    const result = chartSchema.safeParse(baseConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.legend).toBe(true);
    }
  });

  it("applies default grid = true", () => {
    const result = chartSchema.safeParse(baseConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.grid).toBe(true);
    }
  });

  it("applies default emptyMessage", () => {
    const result = chartSchema.safeParse(baseConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.emptyMessage).toBe("No data");
    }
  });

  it("accepts all chart types", () => {
    for (const chartType of ["bar", "line", "area", "pie", "donut"]) {
      const result = chartSchema.safeParse({ ...baseConfig, chartType });
      expect(result.success).toBe(true);
    }
  });

  it("accepts a full config with multiple series", () => {
    const result = chartSchema.safeParse({
      ...baseConfig,
      id: "my-chart",
      chartType: "line",
      series: [
        { key: "revenue", label: "Revenue", color: "var(--sn-chart-1)" },
        { key: "expenses", label: "Expenses", color: "#ff0000" },
      ],
      height: 400,
      legend: false,
      grid: false,
      emptyMessage: "No stats available",
    });
    expect(result.success).toBe(true);
  });

  it("accepts data as a FromRef", () => {
    const result = chartSchema.safeParse({
      ...baseConfig,
      data: { from: "stats-source" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts series without color (uses default)", () => {
    const result = chartSchema.safeParse({
      ...baseConfig,
      series: [{ key: "value", label: "Value" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing data", () => {
    const result = chartSchema.safeParse({ xKey: "month", series: [] });
    expect(result.success).toBe(false);
  });

  it("rejects missing xKey", () => {
    const result = chartSchema.safeParse({
      data: "GET /api/stats",
      series: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing series", () => {
    const result = chartSchema.safeParse({
      data: "GET /api/stats",
      xKey: "month",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid chart type", () => {
    const result = chartSchema.safeParse({
      ...baseConfig,
      chartType: "scatter",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer height", () => {
    const result = chartSchema.safeParse({ ...baseConfig, height: 300.5 });
    expect(result.success).toBe(false);
  });

  it("rejects series item missing key", () => {
    const result = chartSchema.safeParse({
      ...baseConfig,
      series: [{ label: "Revenue" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects series item missing label", () => {
    const result = chartSchema.safeParse({
      ...baseConfig,
      series: [{ key: "revenue" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects extra properties on series item (strict)", () => {
    const result = chartSchema.safeParse({
      ...baseConfig,
      series: [{ key: "revenue", label: "Revenue", unknown: true }],
    });
    expect(result.success).toBe(false);
  });
});
