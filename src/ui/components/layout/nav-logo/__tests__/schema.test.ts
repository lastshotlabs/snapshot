// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { navLogoConfigSchema } from "../schema";

describe("navLogoConfigSchema", () => {
  it("accepts a nav logo config", () => {
    const result = navLogoConfigSchema.safeParse({
      type: "nav-logo",
      text: "Snapshot",
      path: "/",
    });

    expect(result.success).toBe(true);
  });
});
