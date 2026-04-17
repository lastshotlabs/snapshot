import { describe, expect, it } from "vitest";
import { spinnerConfigSchema } from "../schema";

describe("spinnerConfigSchema", () => {
  it("accepts a labeled loading spinner", () => {
    const result = spinnerConfigSchema.safeParse({
      type: "spinner",
      size: "lg",
      label: "Loading data",
    });

    expect(result.success).toBe(true);
  });

  it("accepts a ref-backed label", () => {
    const result = spinnerConfigSchema.safeParse({
      type: "spinner",
      label: { from: "copy.loading.label" },
    });

    expect(result.success).toBe(true);
  });
});
