// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { drawerConfigSchema } from "../schema";

describe("drawerConfigSchema", () => {
  const baseConfig = {
    type: "drawer" as const,
    id: "test-drawer",
    content: [],
  };

  it("accepts a minimal valid config", () => {
    const result = drawerConfigSchema.safeParse(baseConfig);
    expect(result.success).toBe(true);
  });

  it("applies default size of md", () => {
    const result = drawerConfigSchema.parse(baseConfig);
    expect(result.size).toBe("md");
  });

  it("applies default side of right", () => {
    const result = drawerConfigSchema.parse(baseConfig);
    expect(result.side).toBe("right");
  });

  it("accepts left side", () => {
    const result = drawerConfigSchema.safeParse({
      ...baseConfig,
      side: "left",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid side", () => {
    const result = drawerConfigSchema.safeParse({
      ...baseConfig,
      side: "top",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid sizes", () => {
    for (const size of ["sm", "md", "lg", "xl", "full"] as const) {
      const result = drawerConfigSchema.safeParse({ ...baseConfig, size });
      expect(result.success).toBe(true);
    }
  });

  it("accepts a static string title", () => {
    const result = drawerConfigSchema.safeParse({
      ...baseConfig,
      title: "User Details",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a FromRef title", () => {
    const result = drawerConfigSchema.safeParse({
      ...baseConfig,
      title: { from: "users-table.selected.name" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts a trigger FromRef", () => {
    const result = drawerConfigSchema.safeParse({
      ...baseConfig,
      trigger: { from: "users-table.selected" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects wrong type literal", () => {
    const result = drawerConfigSchema.safeParse({
      ...baseConfig,
      type: "modal",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing content", () => {
    const result = drawerConfigSchema.safeParse({
      type: "drawer",
      id: "test",
    });
    expect(result.success).toBe(false);
  });
});
