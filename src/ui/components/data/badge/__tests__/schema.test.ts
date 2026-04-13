// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { badgeConfigSchema } from "../schema";

describe("badgeConfigSchema", () => {
  it("accepts a badge config", () => {
    const result = badgeConfigSchema.safeParse({
      type: "badge",
      text: "Active",
      color: "success",
    });

    expect(result.success).toBe(true);
  });
});
