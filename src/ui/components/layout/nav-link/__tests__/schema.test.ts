import { describe, expect, it } from "vitest";
import { navLinkConfigSchema } from "../schema";

describe("navLinkConfigSchema", () => {
  it("accepts nav-link slot surfaces", () => {
    const result = navLinkConfigSchema.safeParse({
      type: "nav-link",
      label: { from: "global.nav.homeLabel" },
      path: "/home",
      badge: { from: "global.nav.homeBadge" },
      slots: {
        root: {
          className: "nav-link-root",
        },
        label: {
          className: "nav-link-label",
        },
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects extra properties", () => {
    const result = navLinkConfigSchema.safeParse({
      type: "nav-link",
      label: "Home",
      path: "/home",
      props: { invalid: true },
    });

    expect(result.success).toBe(false);
  });
});
