import { describe, expect, it } from "vitest";
import { popoverConfigSchema } from "../schema";

describe("popoverConfigSchema", () => {
  it("accepts popover slots and semantic content fields", () => {
    const result = popoverConfigSchema.safeParse({
      type: "popover",
      trigger: "More",
      title: "Details",
      description: "Context",
      content: [{ type: "text", value: "Body" }],
      footer: [{ type: "text", value: "Footer" }],
      slots: {
        trigger: {
          className: "popover-trigger",
        },
        panel: {
          className: "popover-panel",
        },
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects extra properties", () => {
    const result = popoverConfigSchema.safeParse({
      type: "popover",
      trigger: "More",
      primitiveProps: { invalid: true },
    });

    expect(result.success).toBe(false);
  });
});
