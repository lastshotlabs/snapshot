// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { navLogoConfigSchema } from "../schema";

describe("navLogoConfigSchema", () => {
  it("accepts a nav logo config", () => {
    const result = navLogoConfigSchema.safeParse({
      type: "nav-logo",
      text: "Snapshot",
      path: "/",
      slots: {
        label: {
          className: "nav-logo-label",
        },
      },
    });

    expect(result.success).toBe(true);
  });

  it("accepts ref-backed text", () => {
    const result = navLogoConfigSchema.safeParse({
      type: "nav-logo",
      text: { from: "state.brand.name" },
    });

    expect(result.success).toBe(true);
  });
});
