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

  it("accepts ref-backed label, placeholder, and helper text", () => {
    const result = textareaConfigSchema.safeParse({
      type: "textarea",
      label: { from: "editor.copy.label" },
      placeholder: { from: "editor.copy.placeholder" },
      helperText: { from: "editor.copy.helper" },
    });

    expect(result.success).toBe(true);
  });
});
