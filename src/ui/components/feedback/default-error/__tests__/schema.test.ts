import { describe, expect, it } from "vitest";
import { errorPageConfigSchema } from "../schema";

describe("errorPageConfigSchema", () => {
  it("accepts retryable error states", () => {
    const result = errorPageConfigSchema.safeParse({
      type: "error-page",
      title: "Request failed",
      description: "Please try again.",
      showRetry: true,
    });

    expect(result.success).toBe(true);
  });

  it("accepts ref-backed title, description, and retry label", () => {
    const result = errorPageConfigSchema.safeParse({
      type: "error-page",
      title: { from: "copy.error.title" },
      description: { from: "copy.error.description" },
      retryLabel: { from: "copy.error.retry" },
      showRetry: true,
    });

    expect(result.success).toBe(true);
  });
});
