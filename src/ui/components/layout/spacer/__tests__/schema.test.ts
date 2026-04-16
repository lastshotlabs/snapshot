// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { spacerConfigSchema } from "../schema";

describe("spacerConfigSchema", () => {
  it("accepts semantic size tokens and axes", () => {
    const result = spacerConfigSchema.safeParse({
      type: "spacer",
      size: "xl",
      axis: "horizontal",
    });

    expect(result.success).toBe(true);
  });

  it("accepts canonical root slot overrides", () => {
    const result = spacerConfigSchema.safeParse({
      type: "spacer",
      slots: {
        root: {
          className: "spacer-root-slot",
        },
      },
    });

    expect(result.success).toBe(true);
  });
});
