// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { iconButtonConfigSchema } from "../schema";

describe("iconButtonConfigSchema", () => {
  it("accepts an icon button config", () => {
    const result = iconButtonConfigSchema.safeParse({
      type: "icon-button",
      icon: "search",
      ariaLabel: "Search",
      variant: "ghost",
    });

    expect(result.success).toBe(true);
  });
});
