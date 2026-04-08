import { describe, it, expect } from "vitest";

import { manifestConfigSchema } from "../../ui/manifest/schema";

describe("manifest validation logic", () => {
  it("accepts a minimal valid manifest", () => {
    const manifest = {
      routes: [
        {
          id: "home",
          path: "/home",
          content: [{ type: "heading", text: "Hello" }],
        },
      ],
    };
    const result = manifestConfigSchema.safeParse(manifest);
    expect(result.success).toBe(true);
  });

  it("accepts a full manifest with theme, navigation, auth, and routes", () => {
    const manifest = {
      app: {
        title: "My App",
        shell: "sidebar",
        home: "/home",
      },
      theme: { flavor: "violet" },
      navigation: {
        mode: "sidebar",
        items: [
          { label: "Home", path: "/home" },
          { label: "Settings", path: "/settings", icon: "settings" },
        ],
      },
      auth: {
        screens: ["login", "register"],
        branding: { title: "My App" },
      },
      routes: [
        {
          id: "home",
          path: "/home",
          layout: "sidebar",
          title: "Home",
          content: [{ type: "heading", text: "Welcome" }],
        },
        {
          id: "settings",
          path: "/settings",
          layout: "sidebar",
          title: "Settings",
          content: [{ type: "heading", text: "Settings" }],
        },
      ],
    };
    const result = manifestConfigSchema.safeParse(manifest);
    expect(result.success).toBe(true);
  });

  it("rejects manifest without routes", () => {
    const manifest = { theme: { flavor: "neutral" } };
    const result = manifestConfigSchema.safeParse(manifest);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("routes");
    }
  });

  it("rejects route with empty content array", () => {
    const manifest = {
      routes: [
        {
          id: "home",
          path: "/home",
          content: [],
        },
      ],
    };
    const result = manifestConfigSchema.safeParse(manifest);
    expect(result.success).toBe(false);
  });

  it("rejects invalid auth screen name", () => {
    const manifest = {
      auth: { screens: ["not-a-screen"] },
      routes: [
        {
          id: "home",
          path: "/home",
          content: [{ type: "heading", text: "Hi" }],
        },
      ],
    };
    const result = manifestConfigSchema.safeParse(manifest);
    expect(result.success).toBe(false);
  });

  it("rejects invalid route layout", () => {
    const manifest = {
      routes: [
        {
          id: "home",
          path: "/home",
          layout: "invalid-layout",
          content: [{ type: "heading", text: "Hi" }],
        },
      ],
    };
    const result = manifestConfigSchema.safeParse(manifest);
    expect(result.success).toBe(false);
  });

  it("accepts navigation items with children when paths resolve", () => {
    const manifest = {
      navigation: {
        items: [
          {
            label: "Parent",
            path: "/parent",
            children: [{ label: "Child", path: "/parent/child" }],
          },
        ],
      },
      routes: [
        {
          id: "parent",
          path: "/parent",
          content: [{ type: "heading", text: "Parent" }],
        },
        {
          id: "child",
          path: "/parent/child",
          content: [{ type: "heading", text: "Child" }],
        },
      ],
    };
    const result = manifestConfigSchema.safeParse(manifest);
    expect(result.success).toBe(true);
  });
});
