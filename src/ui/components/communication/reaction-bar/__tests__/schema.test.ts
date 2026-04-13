// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { reactionBarConfigSchema } from "../schema";

describe("reactionBarConfigSchema", () => {
  it("accepts a static reactions config", () => {
    const result = reactionBarConfigSchema.safeParse({
      type: "reaction-bar",
      reactions: [{ emoji: "👍", count: 2, active: true }],
    });

    expect(result.success).toBe(true);
  });
});
