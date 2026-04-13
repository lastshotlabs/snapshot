// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { typingIndicatorConfigSchema } from "../schema";

describe("typingIndicatorConfigSchema", () => {
  it("accepts a typing-indicator config", () => {
    const result = typingIndicatorConfigSchema.safeParse({
      type: "typing-indicator",
      users: [{ name: "Ada" }, { name: "Lin" }],
    });

    expect(result.success).toBe(true);
  });
});
