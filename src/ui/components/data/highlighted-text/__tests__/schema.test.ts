// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { highlightedTextConfigSchema } from "../schema";

describe("highlightedTextConfigSchema", () => {
  it("accepts highlighted text config", () => {
    const result = highlightedTextConfigSchema.safeParse({
      type: "highlighted-text",
      text: "The quick brown fox",
      highlight: "fox",
    });

    expect(result.success).toBe(true);
  });
});
