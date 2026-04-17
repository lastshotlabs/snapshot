import { describe, expect, it } from "vitest";
import { contextMenuConfigSchema } from "../schema";

describe("contextMenuConfigSchema", () => {
  it("accepts typed context menu entries and slot surfaces", () => {
    const result = contextMenuConfigSchema.safeParse({
      type: "context-menu",
      triggerText: "Open",
      items: [
        { type: "label", text: "Actions" },
        { type: "item", label: "Edit", action: { type: "navigate", to: "/edit" } },
        { type: "separator" },
      ],
      slots: {
        root: {
          className: "context-menu-root",
        },
        item: {
          className: "context-menu-item",
        },
      },
    });

    expect(result.success).toBe(true);
  });

  it("accepts ref-backed trigger and item labels", () => {
    const result = contextMenuConfigSchema.safeParse({
      type: "context-menu",
      triggerText: { from: "copy.context.trigger" },
      items: [
        { type: "label", text: { from: "copy.context.section" } },
        { type: "item", label: { from: "copy.context.edit" } },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("rejects extra properties", () => {
    const result = contextMenuConfigSchema.safeParse({
      type: "context-menu",
      props: { invalid: true },
    });

    expect(result.success).toBe(false);
  });
});
