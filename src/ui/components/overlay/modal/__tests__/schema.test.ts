// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { modalConfigSchema } from "../schema";

describe("modalConfigSchema", () => {
  const baseConfig = {
    type: "modal" as const,
    id: "test-modal",
    content: [],
  };

  it("accepts a minimal valid config", () => {
    const result = modalConfigSchema.safeParse(baseConfig);
    expect(result.success).toBe(true);
  });

  it("applies default size of md", () => {
    const result = modalConfigSchema.parse(baseConfig);
    expect(result.size).toBe("md");
  });

  it("accepts all valid sizes", () => {
    for (const size of ["sm", "md", "lg", "xl", "full"] as const) {
      const result = modalConfigSchema.safeParse({ ...baseConfig, size });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid size", () => {
    const result = modalConfigSchema.safeParse({
      ...baseConfig,
      size: "huge",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a static string title", () => {
    const result = modalConfigSchema.safeParse({
      ...baseConfig,
      title: "Edit User",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a FromRef title", () => {
    const result = modalConfigSchema.safeParse({
      ...baseConfig,
      title: { from: "users-table.selected.name" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts a trigger FromRef", () => {
    const result = modalConfigSchema.safeParse({
      ...baseConfig,
      trigger: { from: "users-table.selected" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts content with child component configs", () => {
    const result = modalConfigSchema.safeParse({
      ...baseConfig,
      content: [
        { type: "heading", text: "Hello" },
        { type: "form", submit: "/api/users" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing type", () => {
    const result = modalConfigSchema.safeParse({
      id: "test-modal",
      content: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects wrong type literal", () => {
    const result = modalConfigSchema.safeParse({
      ...baseConfig,
      type: "drawer",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing content", () => {
    const result = modalConfigSchema.safeParse({
      type: "modal",
      id: "test",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional base config fields", () => {
    const result = modalConfigSchema.safeParse({
      ...baseConfig,
      visible: false,
      className: "custom-class",
      span: 6,
    });
    expect(result.success).toBe(true);
  });

  it("accepts visible as FromRef", () => {
    const result = modalConfigSchema.safeParse({
      ...baseConfig,
      visible: { from: "some-toggle" },
    });
    expect(result.success).toBe(true);
  });
});
