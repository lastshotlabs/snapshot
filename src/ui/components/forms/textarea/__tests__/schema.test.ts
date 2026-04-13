// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { textareaConfigSchema } from "../schema";

describe("textareaConfigSchema", () => {
  it("accepts a textarea config", () => {
    const result = textareaConfigSchema.safeParse({
      type: "textarea",
      id: "notes",
      label: "Notes",
      rows: 4,
      maxLength: 280,
    });

    expect(result.success).toBe(true);
  });
});
