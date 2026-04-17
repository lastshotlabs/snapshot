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

  it("accepts FromRef url, aspect ratio, and title", () => {
    const result = embedConfigSchema.safeParse({
      type: "embed",
      url: { from: "embed.url" },
      aspectRatio: { from: "embed.aspectRatio" },
      title: { from: "embed.title" },
    });

    expect(result.success).toBe(true);
  });
});
