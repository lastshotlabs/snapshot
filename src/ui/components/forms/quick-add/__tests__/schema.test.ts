// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { quickAddConfigSchema } from "../schema";

describe("quickAddConfigSchema", () => {
  it("accepts a quick add config", () => {
    const result = quickAddConfigSchema.safeParse({
      type: "quick-add",
      placeholder: "Add task",
      buttonText: "Add",
    });

    expect(result.success).toBe(true);
  });

  it("accepts canonical quick-add slots", () => {
    const result = quickAddConfigSchema.safeParse({
      type: "quick-add",
      slots: {
        root: { className: "root-slot" },
        icon: { className: "icon-slot" },
        input: { className: "input-slot" },
        button: { className: "button-slot" },
      },
    });

    expect(result.success).toBe(true);
  });

  it("accepts ref-backed placeholder and button text", () => {
    const result = quickAddConfigSchema.safeParse({
      type: "quick-add",
      placeholder: { from: "copy.quickAddPlaceholder" },
      buttonText: { from: "copy.quickAddButton" },
    });

    expect(result.success).toBe(true);
  });
});
