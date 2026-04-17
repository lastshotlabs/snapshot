// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { commandPaletteConfigSchema } from "../schema";

describe("commandPaletteConfigSchema", () => {
  it("accepts canonical palette slots", () => {
    const result = commandPaletteConfigSchema.safeParse({
      type: "command-palette",
      groups: [
        {
          label: "Actions",
          items: [{ label: "Open Dashboard" }],
        },
      ],
      slots: {
        panel: {
          className: "palette-panel",
        },
        item: {
          className: "palette-item",
        },
      },
    });

    expect(result.success).toBe(true);
  });

  it("accepts ref-backed placeholder, empty message, group labels, and item copy", () => {
    const result = commandPaletteConfigSchema.safeParse({
      type: "command-palette",
      placeholder: { from: "copy.palette.placeholder" },
      emptyMessage: { from: "copy.palette.empty" },
      groups: [
        {
          label: { from: "copy.palette.group" },
          items: [
            {
              label: { from: "copy.palette.item" },
              description: { from: "copy.palette.itemDescription" },
            },
          ],
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});
