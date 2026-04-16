// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { inlineEditConfigSchema } from "../schema";

describe("inlineEditConfigSchema", () => {
  it("accepts canonical display and input slots", () => {
    const result = inlineEditConfigSchema.safeParse({
      type: "inline-edit",
      value: "Title",
      slots: {
        display: {
          className: "inline-edit-display",
        },
        input: {
          className: "inline-edit-input",
        },
      },
    });

    expect(result.success).toBe(true);
  });

  it("accepts a ref-backed placeholder", () => {
    const result = inlineEditConfigSchema.safeParse({
      type: "inline-edit",
      value: "",
      placeholder: { from: "copy.inlineEditPlaceholder" },
    });

    expect(result.success).toBe(true);
  });
});
