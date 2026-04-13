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
});
