// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { commentSectionConfigSchema } from "../schema";

describe("commentSectionConfigSchema", () => {
  it("accepts a minimal comment section config", () => {
    const result = commentSectionConfigSchema.safeParse({
      type: "comment-section",
      data: "GET /api/comments",
    });

    expect(result.success).toBe(true);
  });
});
