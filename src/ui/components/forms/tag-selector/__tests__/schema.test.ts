/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from "vitest";
import { tagSelectorConfigSchema } from "../schema";

describe("tagSelectorConfigSchema", () => {
  it("accepts a minimal valid tag-selector config", () => {
    const result = tagSelectorConfigSchema.safeParse({
      type: "tag-selector",
      tags: [
        { label: "React", value: "react" },
        { label: "TypeScript", value: "ts" },
      ],
    });

    expect(result.success).toBe(true);
  });
});
