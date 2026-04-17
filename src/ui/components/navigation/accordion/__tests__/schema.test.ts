import { describe, expect, it } from "vitest";
import { accordionConfigSchema } from "../schema";

describe("accordionConfigSchema", () => {
  it("accepts canonical accordion slots", () => {
    const result = accordionConfigSchema.safeParse({
      type: "accordion",
      items: [
        {
          title: "Section",
          content: [],
          slots: {
            item: { className: "accordion-item" },
            triggerLabel: { className: "accordion-label" },
          },
        },
      ],
      slots: {
        root: { className: "accordion-root" },
        content: { className: "accordion-content" },
      },
    });

    expect(result.success).toBe(true);
  });

  it("accepts ref-backed item titles", () => {
    const result = accordionConfigSchema.safeParse({
      type: "accordion",
      items: [
        {
          title: { from: "accordionState.title" },
          content: [],
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});
