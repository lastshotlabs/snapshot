// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { inputConfigSchema } from "../schema";

describe("inputConfigSchema", () => {
  it("accepts an input config", () => {
    const result = inputConfigSchema.safeParse({
      type: "input",
      id: "email",
      label: "Email",
      inputType: "email",
      required: true,
    });

    expect(result.success).toBe(true);
  });

  it("accepts ref-backed label, placeholder, and helper text", () => {
    const result = inputConfigSchema.safeParse({
      type: "input",
      label: { from: "form.copy.label" },
      placeholder: { from: "form.copy.placeholder" },
      helperText: { from: "form.copy.helper" },
    });

    expect(result.success).toBe(true);
  });
});
