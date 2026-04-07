import { describe, it, expect } from "vitest";
import { statCardConfigSchema } from "../schema";

const baseConfig = {
  type: "stat-card" as const,
  data: "GET /api/stats/revenue",
};

describe("statCardConfigSchema", () => {
  it("accepts a minimal valid config", () => {
    const result = statCardConfigSchema.safeParse(baseConfig);
    expect(result.success).toBe(true);
  });

  it("accepts a fully-specified config", () => {
    const result = statCardConfigSchema.safeParse({
      ...baseConfig,
      id: "revenue-card",
      field: "total",
      label: "Revenue",
      format: "currency",
      currency: "EUR",
      decimals: 2,
      prefix: "~",
      suffix: " total",
      icon: "dollar-sign",
      iconColor: "primary",
      trend: {
        field: "previousTotal",
        sentiment: "up-is-good",
        format: "percent",
      },
      action: { type: "navigate", to: "/revenue" },
      span: 2,
      loading: "pulse",
      visible: true,
      className: "my-card",
    });
    expect(result.success).toBe(true);
  });

  it("accepts data as a FromRef", () => {
    const result = statCardConfigSchema.safeParse({
      ...baseConfig,
      data: { from: "filter.endpoint" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts label as a FromRef", () => {
    const result = statCardConfigSchema.safeParse({
      ...baseConfig,
      label: { from: "header.title" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts params with FromRef values", () => {
    const result = statCardConfigSchema.safeParse({
      ...baseConfig,
      params: {
        period: { from: "date-range" },
        category: "sales",
      },
    });
    expect(result.success).toBe(true);
  });

  it("accepts visible as a FromRef", () => {
    const result = statCardConfigSchema.safeParse({
      ...baseConfig,
      visible: { from: "global.showStats" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts responsive span", () => {
    const result = statCardConfigSchema.safeParse({
      ...baseConfig,
      span: { default: 1, md: 2, lg: 3 },
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing type", () => {
    const result = statCardConfigSchema.safeParse({
      data: "GET /api/stats",
    });
    expect(result.success).toBe(false);
  });

  it("rejects wrong type", () => {
    const result = statCardConfigSchema.safeParse({
      type: "data-table",
      data: "GET /api/stats",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing data", () => {
    const result = statCardConfigSchema.safeParse({
      type: "stat-card",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid format", () => {
    const result = statCardConfigSchema.safeParse({
      ...baseConfig,
      format: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid loading variant", () => {
    const result = statCardConfigSchema.safeParse({
      ...baseConfig,
      loading: "bounce",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative decimals", () => {
    const result = statCardConfigSchema.safeParse({
      ...baseConfig,
      decimals: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer decimals", () => {
    const result = statCardConfigSchema.safeParse({
      ...baseConfig,
      decimals: 1.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects extra properties (strict mode)", () => {
    const result = statCardConfigSchema.safeParse({
      ...baseConfig,
      unknownProp: "foo",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid trend sentiment", () => {
    const result = statCardConfigSchema.safeParse({
      ...baseConfig,
      trend: { field: "prev", sentiment: "bad" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid trend format", () => {
    const result = statCardConfigSchema.safeParse({
      ...baseConfig,
      trend: { field: "prev", format: "currency" },
    });
    expect(result.success).toBe(false);
  });

  it("applies defaults — optional fields are undefined", () => {
    const result = statCardConfigSchema.safeParse(baseConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.field).toBeUndefined();
      expect(result.data.label).toBeUndefined();
      expect(result.data.format).toBeUndefined();
      expect(result.data.loading).toBeUndefined();
      expect(result.data.id).toBeUndefined();
    }
  });
});
