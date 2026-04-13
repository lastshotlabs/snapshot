// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { embedConfigSchema } from "../schema";

describe("embedConfigSchema", () => {
  it("accepts an embed config", () => {
    const result = embedConfigSchema.safeParse({
      type: "embed",
      url: "https://example.com/embed",
      title: "Embedded content",
    });

    expect(result.success).toBe(true);
  });
});
