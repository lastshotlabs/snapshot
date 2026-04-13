// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { sliderConfigSchema } from "../schema";

describe("sliderConfigSchema", () => {
  it("accepts a slider config", () => {
    const result = sliderConfigSchema.safeParse({
      type: "slider",
      min: 0,
      max: 100,
      defaultValue: 50,
      label: "Opacity",
      showValue: true,
    });

    expect(result.success).toBe(true);
  });
});
