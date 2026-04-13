// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { voteConfigSchema } from "../schema";

describe("voteConfigSchema", () => {
  it("accepts a vote config", () => {
    const result = voteConfigSchema.safeParse({
      type: "vote",
      value: 10,
    });

    expect(result.success).toBe(true);
  });
});
