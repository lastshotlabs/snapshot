// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { scrollAreaConfigSchema } from "../schema";

describe("scrollAreaConfigSchema", () => {
  it("accepts a scroll area config", () => {
    const result = scrollAreaConfigSchema.safeParse({
      type: "scroll-area",
      maxHeight: "20rem",
      orientation: "vertical",
      showScrollbar: "hover",
      content: [{ type: "markdown", content: "Hello" }],
    });

    expect(result.success).toBe(true);
  });
});
