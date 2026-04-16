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

  it("accepts canonical option and create/error label slots", () => {
    const result = tagSelectorConfigSchema.safeParse({
      type: "tag-selector",
      allowCreate: true,
      tags: [
        { label: "React", value: "react" },
      ],
      slots: {
        errorMessage: { className: "error-message-slot" },
        optionLabel: { className: "option-label-slot" },
        createOptionLabel: { className: "create-option-label-slot" },
      },
    });

    expect(result.success).toBe(true);
  });

  it("accepts a ref-backed label", () => {
    const result = tagSelectorConfigSchema.safeParse({
      type: "tag-selector",
      label: { from: "copy.tagSelectorLabel" },
      tags: [{ label: "React", value: "react" }],
    });

    expect(result.success).toBe(true);
  });
});
