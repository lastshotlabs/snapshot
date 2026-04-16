// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { switchConfigSchema } from "../schema";

describe("switchConfigSchema", () => {
  it("accepts a switch config", () => {
    const result = switchConfigSchema.safeParse({
      type: "switch",
      label: "Enable notifications",
      defaultChecked: false,
    });

    expect(result.success).toBe(true);
  });

  it("accepts ref-backed label and description values", () => {
    const result = switchConfigSchema.safeParse({
      type: "switch",
      label: { from: "copy.switchLabel" },
      description: { from: "copy.switchDescription" },
    });

    expect(result.success).toBe(true);
  });
});
