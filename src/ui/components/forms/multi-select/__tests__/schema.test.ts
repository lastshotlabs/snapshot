// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { multiSelectConfigSchema } from "../schema";

describe("multiSelectConfigSchema", () => {
  it("accepts a multi-select config", () => {
    const result = multiSelectConfigSchema.safeParse({
      type: "multi-select",
      label: "Tags",
      options: [{ label: "Bug", value: "bug" }],
      searchable: true,
    });

    expect(result.success).toBe(true);
  });

  it("accepts canonical multi-select error message slots", () => {
    const result = multiSelectConfigSchema.safeParse({
      type: "multi-select",
      options: [{ label: "Bug", value: "bug" }],
      slots: {
        error: { className: "error-slot" },
        errorMessage: { className: "error-message-slot" },
      },
    });

    expect(result.success).toBe(true);
  });

  it("accepts ref-backed label and placeholder values", () => {
    const result = multiSelectConfigSchema.safeParse({
      type: "multi-select",
      label: { from: "copy.multiSelectLabel" },
      placeholder: { from: "copy.multiSelectPlaceholder" },
      options: [{ label: "Bug", value: "bug" }],
    });

    expect(result.success).toBe(true);
  });

  it("accepts ref-backed static option labels", () => {
    const result = multiSelectConfigSchema.safeParse({
      type: "multi-select",
      options: [{ label: { from: "copy.bugLabel" }, value: "bug" }],
    });

    expect(result.success).toBe(true);
  });
});
