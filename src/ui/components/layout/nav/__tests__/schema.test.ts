// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { navConfigSchema, navItemSchema } from "../schema";

describe("navItemSchema", () => {
  it("accepts a minimal nav item", () => {
    const result = navItemSchema.safeParse({ label: "Home" });
    expect(result.success).toBe(true);
  });

  it("accepts a nav item with all fields", () => {
    const result = navItemSchema.safeParse({
      label: "Dashboard",
      path: "/dashboard",
      icon: "layout-dashboard",
      badge: 5,
      visible: true,
      disabled: false,
      authenticated: true,
      roles: ["admin"],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a FromRef badge", () => {
    const result = navItemSchema.safeParse({
      label: "Notifications",
      path: "/notifications",
      badge: { from: "global.notifications.unread" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts FromRef visibility and disabled states", () => {
    const result = navItemSchema.safeParse({
      label: "Billing",
      path: "/billing",
      visible: { from: "global.flags.billingNav" },
      disabled: { from: "global.flags.billingDisabled" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts nested children", () => {
    const result = navItemSchema.safeParse({
      label: "Settings",
      children: [
        { label: "Profile", path: "/settings/profile" },
        { label: "Security", path: "/settings/security" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing label", () => {
    const result = navItemSchema.safeParse({ path: "/home" });
    expect(result.success).toBe(false);
  });

  it("rejects extra properties", () => {
    const result = navItemSchema.safeParse({
      label: "Home",
      extra: true,
    });
    expect(result.success).toBe(false);
  });
});

describe("navConfigSchema", () => {
  it("accepts a minimal nav config", () => {
    const result = navConfigSchema.safeParse({
      type: "nav",
      items: [{ label: "Home", path: "/" }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts nav config with all options", () => {
    const result = navConfigSchema.safeParse({
      type: "nav",
      items: [
        { label: "Dashboard", path: "/dashboard", icon: "home" },
        { label: "Users", path: "/users", roles: ["admin"] },
      ],
      collapsible: true,
      userMenu: {
        showAvatar: true,
        showEmail: true,
        items: [
          {
            label: "Logout",
            icon: "log-out",
            action: { type: "navigate", to: "/logout" },
          },
        ],
      },
      logo: {
        src: "/logo.png",
        text: "MyApp",
        path: "/",
      },
    });
    expect(result.success).toBe(true);
  });

  it("accepts userMenu as boolean", () => {
    const result = navConfigSchema.safeParse({
      type: "nav",
      items: [{ label: "Home", path: "/" }],
      userMenu: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts userMenu as false", () => {
    const result = navConfigSchema.safeParse({
      type: "nav",
      items: [{ label: "Home", path: "/" }],
      userMenu: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects wrong type", () => {
    const result = navConfigSchema.safeParse({
      type: "layout",
      items: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing items", () => {
    const result = navConfigSchema.safeParse({
      type: "nav",
    });
    expect(result.success).toBe(false);
  });

  it("rejects extra properties", () => {
    const result = navConfigSchema.safeParse({
      type: "nav",
      items: [],
      extra: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid logo config", () => {
    const result = navConfigSchema.safeParse({
      type: "nav",
      items: [],
      logo: { invalid: true },
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty items array", () => {
    const result = navConfigSchema.safeParse({
      type: "nav",
      items: [],
    });
    expect(result.success).toBe(true);
  });

  it("accepts collapsible false", () => {
    const result = navConfigSchema.safeParse({
      type: "nav",
      items: [{ label: "Home", path: "/" }],
      collapsible: false,
    });
    expect(result.success).toBe(true);
  });
});
