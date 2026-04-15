import { describe, expect, it } from "vitest";
import { navUserMenuConfigSchema } from "../schema";

describe("navUserMenuConfigSchema", () => {
  it("accepts nav-user-menu slots", () => {
    const result = navUserMenuConfigSchema.safeParse({
      type: "nav-user-menu",
      showEmail: true,
      items: [
        {
          label: "Sign out",
          action: { type: "navigate", to: "/logout" },
          slots: {
            item: {
              className: "user-item",
            },
          },
        },
      ],
      slots: {
        trigger: {
          className: "user-trigger",
        },
        email: {
          className: "user-email",
        },
        avatarImage: {
          className: "user-avatar-image",
        },
        panel: {
          className: "user-panel",
        },
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects extra properties", () => {
    const result = navUserMenuConfigSchema.safeParse({
      type: "nav-user-menu",
      primitiveProps: { invalid: true },
    });

    expect(result.success).toBe(false);
  });
});
