/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from "vitest";
import { toggleGroupConfigSchema } from "../schema";

describe("toggleGroupConfigSchema", () => {
  it("accepts canonical root and item slots", () => {
    const result = toggleGroupConfigSchema.safeParse({
      type: "toggle-group",
      items: [
        {
          value: "grid",
          label: "Grid",
          slots: {
            item: { className: "item-slot" },
            itemLabel: { className: "item-label-slot" },
          },
        },
      ],
      slots: {
        root: { className: "root-slot" },
        indicator: { className: "indicator-slot" },
      },
    });

    expect(result.success).toBe(true);
  });

  it("accepts a ref-backed item label", () => {
    const result = toggleGroupConfigSchema.safeParse({
      type: "toggle-group",
      items: [
        {
          value: "grid",
          label: { from: "copy.viewLabel" },
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});
