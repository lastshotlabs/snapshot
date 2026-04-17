// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { alertConfigSchema } from "../schema";

describe("alertConfigSchema", () => {
  it("accepts a minimal alert config", () => {
    const result = alertConfigSchema.safeParse({
      type: "alert",
      description: "Saved successfully",
    });

    expect(result.success).toBe(true);
  });

  it("accepts ref-backed action labels", () => {
    const result = alertConfigSchema.safeParse({
      type: "alert",
      description: "Saved successfully",
      actionLabel: { from: "alert.actionLabel" },
    });

    expect(result.success).toBe(true);
  });
});
