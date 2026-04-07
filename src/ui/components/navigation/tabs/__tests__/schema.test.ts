// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { tabsConfigSchema, tabConfigSchema } from "../schema";

describe("tabConfigSchema", () => {
  it("accepts a valid tab", () => {
    const result = tabConfigSchema.safeParse({
      label: "Profile",
      content: [],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a tab with icon", () => {
    const result = tabConfigSchema.safeParse({
      label: "Profile",
      icon: "user",
      content: [],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a disabled tab", () => {
    const result = tabConfigSchema.safeParse({
      label: "Disabled",
      content: [],
      disabled: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects tab without label", () => {
    const result = tabConfigSchema.safeParse({
      content: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects tab without content", () => {
    const result = tabConfigSchema.safeParse({
      label: "Tab",
    });
    expect(result.success).toBe(false);
  });
});

describe("tabsConfigSchema", () => {
  const baseConfig = {
    type: "tabs" as const,
    children: [
      { label: "Tab 1", content: [] },
      { label: "Tab 2", content: [] },
    ],
  };

  it("accepts a minimal valid config", () => {
    const result = tabsConfigSchema.safeParse(baseConfig);
    expect(result.success).toBe(true);
  });

  it("applies default values", () => {
    const result = tabsConfigSchema.parse(baseConfig);
    expect(result.defaultTab).toBe(0);
    expect(result.variant).toBe("default");
  });

  it("accepts defaultTab", () => {
    const result = tabsConfigSchema.safeParse({
      ...baseConfig,
      defaultTab: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts all variants", () => {
    for (const variant of ["default", "underline", "pills"] as const) {
      const result = tabsConfigSchema.safeParse({ ...baseConfig, variant });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid variant", () => {
    const result = tabsConfigSchema.safeParse({
      ...baseConfig,
      variant: "bordered",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty children array", () => {
    const result = tabsConfigSchema.safeParse({
      type: "tabs",
      children: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects wrong type literal", () => {
    const result = tabsConfigSchema.safeParse({
      ...baseConfig,
      type: "modal",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing children", () => {
    const result = tabsConfigSchema.safeParse({
      type: "tabs",
    });
    expect(result.success).toBe(false);
  });

  it("accepts children with component configs as content", () => {
    const result = tabsConfigSchema.safeParse({
      type: "tabs",
      children: [
        {
          label: "Tab 1",
          content: [
            { type: "heading", text: "Hello" },
            { type: "form", submit: "/api" },
          ],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional base config fields", () => {
    const result = tabsConfigSchema.safeParse({
      ...baseConfig,
      id: "settings-tabs",
      visible: true,
      className: "my-tabs",
    });
    expect(result.success).toBe(true);
  });
});
