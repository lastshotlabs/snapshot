// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { toggleConfigSchema } from "../schema";

describe("toggleConfigSchema", () => {
  it("accepts a toggle config", () => {
    const result = toggleConfigSchema.safeParse({
      type: "toggle",
      label: "Bold",
      icon: "bold",
      variant: "outline",
    });

    expect(result.success).toBe(true);
  });

  it("accepts a ref-backed label", () => {
    const result = toggleConfigSchema.safeParse({
      type: "toggle",
      label: { from: "toolbar.boldLabel" },
    });

    expect(result.success).toBe(true);
  });
});
