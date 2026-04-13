// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { tooltipConfigSchema } from "../schema";

describe("tooltipConfigSchema", () => {
  it("accepts canonical content and arrow slots", () => {
    const result = tooltipConfigSchema.safeParse({
      type: "tooltip",
      text: "Helpful context",
      content: [{ type: "spacer", size: "sm" }],
      slots: {
        content: {
          className: "tooltip-content",
        },
        arrow: {
          className: "tooltip-arrow",
        },
      },
    });

    expect(result.success).toBe(true);
  });
});
