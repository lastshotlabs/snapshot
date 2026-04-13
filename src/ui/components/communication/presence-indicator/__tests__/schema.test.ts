// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { presenceIndicatorConfigSchema } from "../schema";

describe("presenceIndicatorConfigSchema", () => {
  it("accepts a presence config", () => {
    const result = presenceIndicatorConfigSchema.safeParse({
      type: "presence-indicator",
      status: "online",
      label: "Ada",
    });

    expect(result.success).toBe(true);
  });
});
