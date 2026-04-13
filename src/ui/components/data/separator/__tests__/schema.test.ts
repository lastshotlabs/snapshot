// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { separatorConfigSchema } from "../schema";

describe("separatorConfigSchema", () => {
  it("accepts a separator config", () => {
    const result = separatorConfigSchema.safeParse({
      type: "separator",
      orientation: "horizontal",
      label: "Continue",
    });

    expect(result.success).toBe(true);
  });
});
