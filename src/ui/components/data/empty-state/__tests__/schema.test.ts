// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { emptyStateConfigSchema } from "../schema";

describe("emptyStateConfigSchema", () => {
  it("accepts an empty state config", () => {
    const result = emptyStateConfigSchema.safeParse({
      type: "empty-state",
      title: "No results",
      description: "Try adjusting your filters.",
      icon: "search",
      actionLabel: "Clear filters",
    });

    expect(result.success).toBe(true);
  });
});
