import { describe, expect, it } from "vitest";
import { breadcrumbConfigSchema } from "../schema";

describe("breadcrumbConfigSchema", () => {
  it("requires items when source is manual", () => {
    const result = breadcrumbConfigSchema.safeParse({
      type: "breadcrumb",
      source: "manual",
    });

    expect(result.success).toBe(false);
  });

  it("allows route-derived breadcrumbs without manual items", () => {
    const result = breadcrumbConfigSchema.safeParse({
      type: "breadcrumb",
      source: "route",
    });

    expect(result.success).toBe(true);
  });

  it("accepts ref-backed manual labels", () => {
    const result = breadcrumbConfigSchema.safeParse({
      type: "breadcrumb",
      items: [{ label: { from: "breadcrumbState.home" }, path: "/" }],
    });

    expect(result.success).toBe(true);
  });
});
