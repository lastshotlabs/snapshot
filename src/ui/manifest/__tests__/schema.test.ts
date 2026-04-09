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
          pollMs: 60000,
          refetchOnWindowFocus: true,
          invalidates: ["user.stats"],
        },
        "user.stats": {
          method: "GET",
          endpoint: "/api/users/stats",
          dependsOn: ["user.list"],
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
        redirects: {
          authenticated: "/dashboard",
          afterLogin: "/users",
        },
        screenOptions: {
          login: {
            title: "Welcome back",
            submitLabel: "Log in",
            sections: ["providers", "passkey", "form", "links"],
            labels: {
              providersHeading: "Use a provider",
              passkeyButton: "Use a passkey",
            },
            providers: false,
            passkey: false,
            fields: {
              email: {
                label: "Work email",
                placeholder: "me@company.com",
              },
            },
            links: [{ label: "Create one", screen: "register" }],
          },
        },
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
        "users.sync": {
          type: "retry",
          attempts: 3,
          delayMs: 250,
          backoffMultiplier: 2,
          step: {
            type: "api",
            method: "POST",
            endpoint: "/api/users/sync",
          },
          onFailure: {
            type: "toast",
            message: "Sync failed",
          },
        },
        "users.decorate": [
          {
            type: "assign",
            values: {
              source: "manifest",
            },
          },
          {
            type: "toast",
            message: "Decorated",
          },
        ],
        "users.reconcile": {
          type: "try",
          step: {
            type: "api",
            method: "POST",
            endpoint: "/api/users/reconcile",
          },
          catch: {
            type: "toast",
            message: "Reconcile failed",
          },
          finally: {
            type: "toast",
            message: "Reconcile complete",
          },
        },
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
          preload: [
            "user.list",
            {
              resource: "user.stats",
              params: { range: "30d" },
            },
          ],
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

  it("rejects retry workflow nodes without attempts", () => {
    const result = manifestConfigSchema.safeParse({
      workflows: {
        bad: {
          type: "retry",
          step: { type: "toast", message: "no attempts" },
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

  it("rejects resource dependencies that do not exist", () => {
    const result = manifestConfigSchema.safeParse({
      resources: {
        users: {
          method: "GET",
          endpoint: "/api/users",
          dependsOn: ["missing"],
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

  it("rejects invalidation targets that do not exist", () => {
    const result = manifestConfigSchema.safeParse({
      resources: {
        "users.create": {
          method: "POST",
          endpoint: "/api/users",
          invalidates: ["missing"],
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
      preload: [
        {
          resource: "users",
          params: { page: 1 },
        },
      ],
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
      providers: [
        "google",
        {
          provider: "github",
          label: "Continue with GitHub Enterprise",
          description: "Use your engineering identity",
        },
      ],
      passkey: true,
      branding: {
        logo: "/logo.svg",
        title: "My App",
        description: "Welcome back",
      },
      redirects: {
        authenticated: "/dashboard",
        afterLogin: "/reports",
      },
      screenOptions: {
        login: {
          title: "Welcome back",
          description: "Use your work account",
          submitLabel: "Continue",
          sections: ["providers", "form", "links"],
          labels: {
            providersHeading: "Use a provider",
            passkeyButton: "Use a passkey",
          },
          providers: false,
          passkey: false,
          fields: {
            email: {
              label: "Work email",
              placeholder: "me@company.com",
            },
            password: {
              label: "Secret phrase",
            },
          },
          links: [{ label: "Create account", screen: "register" }],
        },
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects auth links without a path or screen target", () => {
    const result = authScreenConfigSchema.safeParse({
      screens: ["login"],
      screenOptions: {
        login: {
          links: [{ label: "Broken link" }],
        },
      },
    });
    expect(result.success).toBe(false);
  });

  it("accepts provider presentation config in screen options", () => {
    const result = authScreenConfigSchema.safeParse({
      screens: ["login"],
      screenOptions: {
        login: {
          providers: [
            {
              provider: "google",
              label: "Use Google Workspace",
              description: "Recommended for internal users",
            },
          ],
        },
      },
    });

    expect(result.success).toBe(true);
  });
});
