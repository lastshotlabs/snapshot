// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { navSearchConfigSchema } from "../schema";

describe("navSearchConfigSchema", () => {
  it("accepts a nav search config", () => {
    const result = navSearchConfigSchema.safeParse({
      type: "nav-search",
      placeholder: "Search docs",
      shortcut: "ctrl+k",
      slots: {
        input: {
          className: "nav-search-input",
        },
      },
    });

    expect(result.success).toBe(true);
  });

  it("accepts a ref-backed placeholder", () => {
    const result = navSearchConfigSchema.safeParse({
      type: "nav-search",
      placeholder: { from: "copy.navSearch.placeholder" },
    });

    expect(result.success).toBe(true);
  });
});
