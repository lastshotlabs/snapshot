import { describe, expect, it } from "vitest";
import { navSectionConfigSchema } from "../schema";

describe("navSectionConfigSchema", () => {
  it("accepts nav-section slots", () => {
    const result = navSectionConfigSchema.safeParse({
      type: "nav-section",
      label: "Resources",
      items: [{ type: "heading", text: "Item" }],
      slots: {
        root: {
          className: "nav-section-root",
        },
        content: {
          className: "nav-section-content",
        },
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects extra properties", () => {
    const result = navSectionConfigSchema.safeParse({
      type: "nav-section",
      items: [],
      panelProps: { invalid: true },
    });

    expect(result.success).toBe(false);
  });

  it("accepts ref-backed labels", () => {
    const result = navSectionConfigSchema.safeParse({
      type: "nav-section",
      label: { from: "navSection.label" },
      items: [{ type: "heading", text: "Item" }],
    });

    expect(result.success).toBe(true);
  });
});
