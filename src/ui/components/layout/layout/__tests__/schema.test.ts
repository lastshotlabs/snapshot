// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { layoutConfigSchema } from "../schema";

describe("layoutConfigSchema", () => {
  it("accepts a valid sidebar layout", () => {
    const result = layoutConfigSchema.safeParse({
      type: "layout",
      variant: "sidebar",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid top-nav layout", () => {
    const result = layoutConfigSchema.safeParse({
      type: "layout",
      variant: "top-nav",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid minimal layout", () => {
    const result = layoutConfigSchema.safeParse({
      type: "layout",
      variant: "minimal",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid full-width layout", () => {
    const result = layoutConfigSchema.safeParse({
      type: "layout",
      variant: "full-width",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty variant", () => {
    const result = layoutConfigSchema.safeParse({
      type: "layout",
      variant: "",
    });
    expect(result.success).toBe(false);
  });

  it("applies default variant when missing", () => {
    const result = layoutConfigSchema.safeParse({
      type: "layout",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.variant).toBe("sidebar");
    }
  });

  it("rejects wrong type", () => {
    const result = layoutConfigSchema.safeParse({
      type: "nav",
      variant: "sidebar",
    });
    expect(result.success).toBe(false);
  });

  it("rejects extra properties", () => {
    const result = layoutConfigSchema.safeParse({
      type: "layout",
      variant: "sidebar",
      extra: true,
    });
    expect(result.success).toBe(false);
  });
});
