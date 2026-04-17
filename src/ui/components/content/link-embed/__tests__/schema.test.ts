// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { linkEmbedConfigSchema } from "../schema";

describe("linkEmbedConfigSchema", () => {
  it("accepts a link embed config with metadata", () => {
    const result = linkEmbedConfigSchema.safeParse({
      type: "link-embed",
      url: "https://example.com/post",
      meta: {
        title: "Example Post",
        description: "A preview card",
        siteName: "Example",
      },
      allowIframe: false,
    });

    expect(result.success).toBe(true);
  });

  it("accepts FromRef metadata copy", () => {
    const result = linkEmbedConfigSchema.safeParse({
      type: "link-embed",
      url: "https://example.com/post",
      meta: {
        title: { from: "link.title" },
        description: { from: "link.description" },
        siteName: { from: "link.siteName" },
      },
    });

    expect(result.success).toBe(true);
  });
});
