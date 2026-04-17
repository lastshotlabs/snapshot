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

  it("accepts ref-backed input and empty-state copy", () => {
    const result = commentSectionConfigSchema.safeParse({
      type: "comment-section",
      data: "GET /api/comments",
      inputPlaceholder: { from: "state.comments.placeholder" },
      emptyMessage: { from: "state.comments.empty" },
    });

    expect(result.success).toBe(true);
  });
});
