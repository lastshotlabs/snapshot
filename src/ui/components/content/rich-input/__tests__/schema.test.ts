// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { richInputConfigSchema } from "../schema";

describe("richInputConfigSchema", () => {
  it("accepts a rich input config", () => {
    const result = richInputConfigSchema.safeParse({
      type: "rich-input",
      id: "composer",
      placeholder: "Write a message",
      features: ["bold", "italic", "link"],
      sendOnEnter: true,
      maxLength: 280,
    });

    expect(result.success).toBe(true);
  });

  it("accepts a ref-backed placeholder", () => {
    const result = richInputConfigSchema.safeParse({
      type: "rich-input",
      placeholder: { from: "copy.richInput.placeholder" },
    });

    expect(result.success).toBe(true);
  });
});
