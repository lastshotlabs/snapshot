// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { colorPickerConfigSchema } from "../schema";

describe("colorPickerConfigSchema", () => {
  it("accepts a color picker config", () => {
    const result = colorPickerConfigSchema.safeParse({
      type: "color-picker",
      label: "Brand color",
      defaultValue: "#2563eb",
      swatches: ["#2563eb", "#10b981"],
      allowCustom: true,
      showAlpha: false,
    });

    expect(result.success).toBe(true);
  });

  it("accepts a ref-backed label", () => {
    const result = colorPickerConfigSchema.safeParse({
      type: "color-picker",
      label: { from: "copy.colorLabel" },
    });

    expect(result.success).toBe(true);
  });
});
