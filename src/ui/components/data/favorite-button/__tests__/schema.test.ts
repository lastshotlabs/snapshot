// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { favoriteButtonConfigSchema } from "../schema";

describe("favoriteButtonConfigSchema", () => {
  it("accepts a favorite button config", () => {
    const result = favoriteButtonConfigSchema.safeParse({
      type: "favorite-button",
      active: true,
      size: "md",
    });

    expect(result.success).toBe(true);
  });
});
