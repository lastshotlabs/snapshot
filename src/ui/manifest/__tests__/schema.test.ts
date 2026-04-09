/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from "vitest";
import {
  manifestConfigSchema,
  pageConfigSchema,
  routeConfigSchema,
  rowConfigSchema,
  headingConfigSchema,
  buttonConfigSchema,
  selectConfigSchema,
  customComponentConfigSchema,
  componentConfigSchema,
  navItemSchema,
  navigationConfigSchema,
  authScreenConfigSchema,
} from "../schema";

describe("manifestConfigSchema", () => {
  it("validates a full valid manifest", () => {
    const manifest = {
      app: {
        title: "Snapshot App",
        shell: "sidebar",
        home: "/dashboard",
      },
      theme: { flavor: "neutral" },
      state: {
        user: { data: "GET /api/me", default: null },
        filters: { scope: "route", default: { status: "all" } },
      },
      resources: {
        "user.list": {
          method: "GET",
          endpoint: "/api/users",
          cacheMs: 30000,
        },
      },
      navigation: {
        mode: "sidebar",
        items: [
          { label: "Dashboard", path: "/dashboard", icon: "home" },
          {
            label: "Users",
            path: "/users",
            roles: ["admin"],
            children: [{ label: "All Users", path: "/users/all" }],
          },
        ],
      },
      auth: {
        screens: ["login", "register"] as const,
        providers: ["google", "github"] as const,
      },
      workflows: {
        "users.delete": {
          type: "if",
          condition: {
            left: { from: "global.user.role" },
            operator: "equals",
            right: "admin",
          },
          then: {
            type: "run-workflow",
            workflow: "users.delete-confirmed",
          },
        },
        "users.delete-confirmed": [
          { type: "confirm", message: "Delete?" },
          { type: "api", method: "DELETE", endpoint: "/api/users/{id}" },
        ],
      },
      overlays: {
        help: {
          type: "modal",
          title: "Help",
          content: [{ type: "heading", text: "Overlay" }],
        },
      },
      routes: [
        {
          id: "dashboard",
          path: "/dashboard",
          title: "Dashboard",
          layout: "sidebar" as const,
          preload: ["user.list"],
          guard: {
            authenticated: true,
            redirectTo: "/dashboard",
          },
          content: [
            {
              type: "heading",
              text: "Welcome",
              level: 1,
            },
          ],
        },
        {
          id: "users",
          path: "/users",
          title: "Users",
          layout: "sidebar" as const,
          content: [{ type: "heading", text: "Users" }],
        },
        {
          id: "users-all",
          path: "/users/all",
          title: "All Users",
          layout: "sidebar" as const,
          content: [{ type: "heading", text: "All Users" }],
        },
      ],
    };

    const result = manifestConfigSchema.safeParse(manifest);
    expect(result.success).toBe(true);
  });

  it("rejects manifest missing routes", () => {
    const result = manifestConfigSchema.safeParse({
      theme: { flavor: "neutral" },
    });
    expect(result.success).toBe(false);
  });

  it("accepts minimal manifest with only routes", () => {
    const result = manifestConfigSchema.safeParse({
      routes: [
        {
          id: "home",
          path: "/",
          content: [{ type: "heading", text: "Hello" }],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects duplicate route ids", () => {
    const result = manifestConfigSchema.safeParse({
      routes: [
        { id: "home", path: "/", content: [{ type: "heading", text: "A" }] },
        {
          id: "home",
          path: "/about",
          content: [{ type: "heading", text: "B" }],
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects navigation paths that do not match routes", () => {
    const result = manifestConfigSchema.safeParse({
      navigation: {
        items: [{ label: "Ghost", path: "/ghost" }],
      },
      routes: [
        {
          id: "home",
          path: "/",
          content: [{ type: "heading", text: "Home" }],
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid state scope values", () => {
    const result = manifestConfigSchema.safeParse({
      state: {
        bad: { scope: "overlay" },
      },
      routes: [
        {
          id: "home",
          path: "/",
          content: [{ type: "heading", text: "Home" }],
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid workflow nodes", () => {
    const result = manifestConfigSchema.safeParse({
      workflows: {
        bad: {
          type: "if",
          then: { type: "toast", message: "no condition" },
        },
      },
      routes: [
        {
          id: "home",
          path: "/",
          content: [{ type: "heading", text: "Home" }],
        },
      ],
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
});

describe("routeConfigSchema", () => {
  it("validates a route with id and path", () => {
    const result = routeConfigSchema.safeParse({
      id: "dashboard",
      path: "/dashboard",
      title: "Dashboard",
      content: [{ type: "heading", text: "Hello" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects route paths that do not start with /", () => {
    const result = routeConfigSchema.safeParse({
      id: "dashboard",
      path: "dashboard",
      content: [{ type: "heading", text: "Hello" }],
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
});

describe("nav schemas", () => {
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

  it("validates navigation config", () => {
    const result = navigationConfigSchema.safeParse({
      mode: "sidebar",
      items: [
        {
          label: "Home",
          path: "/",
          visible: { from: "global.flags.showHome" },
          disabled: false,
          authenticated: true,
        },
      ],
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
});
