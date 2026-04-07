import { describe, it, expect } from "vitest";
import {
  formatValue,
  detectNumericField,
  calculateTrend,
  humanizeFieldName,
} from "../format";

describe("formatValue", () => {
  it("formats a plain number with grouping", () => {
    expect(formatValue(12345)).toBe("12,345");
  });

  it("formats with explicit 'number' format", () => {
    expect(formatValue(12345, "number")).toBe("12,345");
  });

  it("formats currency with default USD", () => {
    const result = formatValue(12345, "currency");
    expect(result).toContain("12,345");
    expect(result).toContain("$");
  });

  it("formats currency with custom code", () => {
    const result = formatValue(12345, "currency", { currency: "EUR" });
    expect(result).toContain("12,345");
    expect(result).toContain("\u20AC");
  });

  it("formats percent (value as fraction)", () => {
    const result = formatValue(0.89, "percent");
    expect(result).toBe("89%");
  });

  it("formats compact numbers", () => {
    const result = formatValue(1234567, "compact");
    // Intl formats 1234567 as "1.2M"
    expect(result).toContain("M");
  });

  it("formats decimal with specified decimals", () => {
    const result = formatValue(3.14159, "decimal", { decimals: 2 });
    expect(result).toBe("3.14");
  });

  it("applies prefix and suffix", () => {
    const result = formatValue(42, "number", {
      prefix: "~",
      suffix: " items",
    });
    expect(result).toBe("~42 items");
  });

  it("handles zero", () => {
    expect(formatValue(0)).toBe("0");
  });

  it("handles negative numbers", () => {
    const result = formatValue(-500, "currency");
    expect(result).toContain("500");
    expect(result).toContain("-");
  });

  it("applies decimals to currency", () => {
    const result = formatValue(100, "currency", { decimals: 0 });
    expect(result).toBe("$100");
  });
});

describe("detectNumericField", () => {
  it("returns the first numeric field", () => {
    expect(
      detectNumericField({ name: "Revenue", total: 12345, count: 42 }),
    ).toBe("total");
  });

  it("skips non-numeric fields", () => {
    expect(detectNumericField({ label: "test", status: true, value: 99 })).toBe(
      "value",
    );
  });

  it("returns undefined when no numeric fields exist", () => {
    expect(detectNumericField({ name: "test", active: true })).toBeUndefined();
  });

  it("skips NaN values", () => {
    expect(detectNumericField({ bad: NaN, good: 42 })).toBe("good");
  });

  it("returns undefined for empty object", () => {
    expect(detectNumericField({})).toBeUndefined();
  });
});

describe("calculateTrend", () => {
  it("detects upward trend", () => {
    const result = calculateTrend(120, 100);
    expect(result.direction).toBe("up");
    expect(result.value).toBe(20);
    expect(result.percentage).toBeCloseTo(20);
  });

  it("detects downward trend", () => {
    const result = calculateTrend(80, 100);
    expect(result.direction).toBe("down");
    expect(result.value).toBe(20);
    expect(result.percentage).toBeCloseTo(-20);
  });

  it("detects flat trend", () => {
    const result = calculateTrend(100, 100);
    expect(result.direction).toBe("flat");
    expect(result.value).toBe(0);
    expect(result.percentage).toBe(0);
  });

  it("handles zero comparison as flat when current is also zero", () => {
    const result = calculateTrend(0, 0);
    expect(result.direction).toBe("flat");
    expect(result.percentage).toBe(0);
  });

  it("handles zero comparison with positive current as up", () => {
    const result = calculateTrend(50, 0);
    expect(result.direction).toBe("up");
    expect(result.value).toBe(50);
  });

  it("calculates negative comparison correctly", () => {
    const result = calculateTrend(-50, -100);
    expect(result.direction).toBe("up");
    expect(result.value).toBe(50);
    expect(result.percentage).toBeCloseTo(50);
  });
});

describe("humanizeFieldName", () => {
  it("converts camelCase", () => {
    expect(humanizeFieldName("totalRevenue")).toBe("Total Revenue");
  });

  it("converts snake_case", () => {
    expect(humanizeFieldName("user_count")).toBe("User Count");
  });

  it("converts kebab-case", () => {
    expect(humanizeFieldName("active-users")).toBe("Active Users");
  });

  it("handles single word", () => {
    expect(humanizeFieldName("revenue")).toBe("Revenue");
  });

  it("handles already-capitalized words", () => {
    expect(humanizeFieldName("API")).toBe("API");
  });
});
