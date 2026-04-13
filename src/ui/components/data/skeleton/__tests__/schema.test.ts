// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { skeletonConfigSchema } from "../schema";

describe("skeletonConfigSchema", () => {
  it("accepts a skeleton config", () => {
    const result = skeletonConfigSchema.safeParse({
      type: "skeleton",
      variant: "text",
      lines: 4,
      animated: true,
    });

    expect(result.success).toBe(true);
  });
});
