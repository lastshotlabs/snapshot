import { describe, expect, it } from "vitest";
import { navDropdownConfigSchema } from "../schema";

describe("navDropdownConfigSchema", () => {
  it("accepts nav-dropdown slot surfaces", () => {
    const result = navDropdownConfigSchema.safeParse({
      type: "nav-dropdown",
      label: "Products",
      items: [{ type: "heading", text: "Item" }],
      slots: {
        trigger: {
          className: "nav-dropdown-trigger",
        },
        panel: {
          className: "nav-dropdown-panel",
        },
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects extra properties", () => {
    const result = navDropdownConfigSchema.safeParse({
      type: "nav-dropdown",
      label: "Products",
      items: [],
      triggerProps: { invalid: true },
    });

    expect(result.success).toBe(false);
  });
});
