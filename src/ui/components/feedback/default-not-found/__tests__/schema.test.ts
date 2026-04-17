import { describe, expect, it } from "vitest";
import { notFoundConfigSchema } from "../schema";

describe("notFoundConfigSchema", () => {
  it("accepts not-found content", () => {
    const result = notFoundConfigSchema.safeParse({
      type: "not-found",
      title: "Missing",
      description: "We could not find that page.",
      homeLabel: "Go home",
    });

    expect(result.success).toBe(true);
  });

  it("accepts ref-backed title, description, and home label", () => {
    const result = notFoundConfigSchema.safeParse({
      type: "not-found",
      title: { from: "copy.notFound.title" },
      description: { from: "copy.notFound.description" },
      homeLabel: { from: "copy.notFound.homeLabel" },
    });

    expect(result.success).toBe(true);
  });
});
