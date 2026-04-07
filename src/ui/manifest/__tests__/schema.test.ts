/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from "vitest";
import {
  manifestConfigSchema,
  pageConfigSchema,
  rowConfigSchema,
  headingConfigSchema,
  buttonConfigSchema,
  selectConfigSchema,
  customComponentConfigSchema,
  componentConfigSchema,
  navItemSchema,
  authScreenConfigSchema,
} from "../schema";

describe("manifestConfigSchema", () => {
  it("validates a full valid manifest", () => {
    const manifest = {
      theme: { flavor: "neutral" },
      globals: {
        user: { data: "GET /api/me", default: null },
      },
      nav: [
        { label: "Dashboard", path: "/dashboard", icon: "home" },
        {
          label: "Users",
          path: "/users",
          roles: ["admin"],
          children: [{ label: "All Users", path: "/users/all" }],
        },
      ],
      auth: {
        screens: ["login", "register"] as const,
        providers: ["google", "github"] as const,
      },
      pages: {
        "/dashboard": {
          title: "Dashboard",
          layout: "sidebar" as const,
          content: [
            {
              type: "heading",
              text: "Welcome",
              level: 1,
            },
          ],
        },
      },
    };

    const result = manifestConfigSchema.safeParse(manifest);
    expect(result.success).toBe(true);
  });

  it("rejects manifest missing pages (required)", () => {
    const result = manifestConfigSchema.safeParse({
      theme: { flavor: "neutral" },
    });
    expect(result.success).toBe(false);
  });

  it("accepts minimal manifest with only pages", () => {
    const result = manifestConfigSchema.safeParse({
      pages: {
        "/": {
          content: [{ type: "heading", text: "Hello" }],
        },
      },
    });
    expect(result.success).toBe(true);
  });

  it("allows optional $schema field", () => {
    const result = manifestConfigSchema.safeParse({
      $schema: "https://snapshot.dev/schema.json",
      pages: {
        "/": { content: [{ type: "heading", text: "Test" }] },
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid theme config", () => {
    const result = manifestConfigSchema.safeParse({
      theme: { flavor: 123 },
      pages: {
        "/": { content: [{ type: "heading", text: "Test" }] },
      },
    });
    expect(result.success).toBe(false);
  });
});

describe("pageConfigSchema", () => {
  it("validates a page with layout and content", () => {
    const result = pageConfigSchema.safeParse({
      layout: "sidebar",
      title: "Dashboard",
      content: [{ type: "heading", text: "Hello" }],
      roles: ["admin"],
      breadcrumb: "Home",
    });
    expect(result.success).toBe(true);
  });

  it("rejects page with empty content array", () => {
    const result = pageConfigSchema.safeParse({
      content: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid layout value", () => {
    const result = pageConfigSchema.safeParse({
      layout: "invalid-layout",
      content: [{ type: "heading", text: "Test" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("componentConfigSchema", () => {
  it("validates known component types via registry", () => {
    const result = componentConfigSchema.safeParse({
      type: "heading",
      text: "Hello World",
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown component types with descriptive error", () => {
    const result = componentConfigSchema.safeParse({
      type: "nonexistent-widget",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues[0]?.message ?? "";
      expect(msg).toContain("Unknown component type");
      expect(msg).toContain("nonexistent-widget");
    }
  });

  it("allows custom type without registry lookup", () => {
    const result = componentConfigSchema.safeParse({
      type: "custom",
      component: "MyWidget",
    });
    expect(result.success).toBe(true);
  });
});

describe("rowConfigSchema", () => {
  it("validates a row with children", () => {
    const result = rowConfigSchema.safeParse({
      type: "row",
      gap: "md",
      justify: "between",
      align: "center",
      wrap: true,
      children: [{ type: "heading", text: "Col 1" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects row with no children", () => {
    const result = rowConfigSchema.safeParse({
      type: "row",
      children: [],
    });
    expect(result.success).toBe(false);
  });

  it("accepts responsive gap", () => {
    const result = rowConfigSchema.safeParse({
      type: "row",
      gap: { default: "sm", md: "lg" },
      children: [{ type: "heading", text: "Test" }],
    });
    expect(result.success).toBe(true);
  });
});

describe("headingConfigSchema", () => {
  it("validates heading with text and level", () => {
    const result = headingConfigSchema.safeParse({
      type: "heading",
      text: "Dashboard",
      level: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts FromRef as text", () => {
    const result = headingConfigSchema.safeParse({
      type: "heading",
      text: { from: "global.user.name" },
    });
    expect(result.success).toBe(true);
  });

  it("defaults level when omitted", () => {
    const result = headingConfigSchema.safeParse({
      type: "heading",
      text: "Hello",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid level", () => {
    const result = headingConfigSchema.safeParse({
      type: "heading",
      text: "Hello",
      level: 7,
    });
    expect(result.success).toBe(false);
  });
});

describe("buttonConfigSchema", () => {
  it("validates button with label and action", () => {
    const result = buttonConfigSchema.safeParse({
      type: "button",
      label: "Click me",
      action: { type: "navigate", path: "/dashboard" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts action array", () => {
    const result = buttonConfigSchema.safeParse({
      type: "button",
      label: "Save",
      action: [
        { type: "api", method: "POST", endpoint: "/save" },
        { type: "toast", message: "Saved!" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts FromRef for disabled", () => {
    const result = buttonConfigSchema.safeParse({
      type: "button",
      label: "Submit",
      action: { type: "navigate", path: "/" },
      disabled: { from: "form.isInvalid" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects button without action", () => {
    const result = buttonConfigSchema.safeParse({
      type: "button",
      label: "Click me",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all variant values", () => {
    const variants = [
      "default",
      "secondary",
      "outline",
      "ghost",
      "destructive",
      "link",
    ] as const;
    for (const variant of variants) {
      const result = buttonConfigSchema.safeParse({
        type: "button",
        label: "Test",
        variant,
        action: { type: "navigate", path: "/" },
      });
      expect(result.success).toBe(true);
    }
  });
});

describe("selectConfigSchema", () => {
  it("validates select with static options", () => {
    const result = selectConfigSchema.safeParse({
      type: "select",
      options: [
        { label: "Option A", value: "a" },
        { label: "Option B", value: "b" },
      ],
      default: "a",
      placeholder: "Choose...",
    });
    expect(result.success).toBe(true);
  });

  it("accepts endpoint string for options", () => {
    const result = selectConfigSchema.safeParse({
      type: "select",
      options: "GET /api/categories",
      valueField: "id",
      labelField: "name",
    });
    expect(result.success).toBe(true);
  });

  it("rejects select without options", () => {
    const result = selectConfigSchema.safeParse({
      type: "select",
    });
    expect(result.success).toBe(false);
  });
});

describe("customComponentConfigSchema", () => {
  it("validates custom component with name", () => {
    const result = customComponentConfigSchema.safeParse({
      type: "custom",
      component: "MyWidget",
      props: { currency: "EUR" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects custom component without component name", () => {
    const result = customComponentConfigSchema.safeParse({
      type: "custom",
    });
    expect(result.success).toBe(false);
  });
});

describe("navItemSchema", () => {
  it("validates nav item with nested children", () => {
    const result = navItemSchema.safeParse({
      label: "Settings",
      path: "/settings",
      icon: "settings",
      children: [
        { label: "General", path: "/settings/general" },
        { label: "Security", path: "/settings/security" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts FromRef badge", () => {
    const result = navItemSchema.safeParse({
      label: "Notifications",
      path: "/notifications",
      badge: { from: "global.notifications.unread" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts numeric badge", () => {
    const result = navItemSchema.safeParse({
      label: "Messages",
      path: "/messages",
      badge: 5,
    });
    expect(result.success).toBe(true);
  });
});

describe("authScreenConfigSchema", () => {
  it("validates auth config", () => {
    const result = authScreenConfigSchema.safeParse({
      screens: ["login", "register", "forgot-password"],
      providers: ["google", "github"],
      passkey: true,
      branding: {
        logo: "/logo.svg",
        title: "My App",
        description: "Welcome back",
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty screens array", () => {
    const result = authScreenConfigSchema.safeParse({
      screens: [],
    });
    expect(result.success).toBe(false);
  });
});
