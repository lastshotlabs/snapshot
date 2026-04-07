import { describe, it, expect } from "vitest";

// Import schema + register built-in component schemas (side-effect)
import { manifestConfigSchema } from "../../ui/manifest/schema";

describe("manifest validation logic", () => {
  it("accepts a minimal valid manifest", () => {
    const manifest = {
      pages: {
        "/home": {
          content: [{ type: "heading", text: "Hello" }],
        },
      },
    };
    const result = manifestConfigSchema.safeParse(manifest);
    expect(result.success).toBe(true);
  });

  it("accepts a full manifest with theme, nav, auth, and pages", () => {
    const manifest = {
      theme: { flavor: "violet" },
      nav: [
        { label: "Home", path: "/" },
        { label: "Settings", path: "/settings", icon: "settings" },
      ],
      auth: {
        screens: ["login", "register"],
        branding: { title: "My App" },
      },
      pages: {
        "/home": {
          layout: "sidebar",
          title: "Home",
          content: [{ type: "heading", text: "Welcome" }],
        },
      },
    };
    const result = manifestConfigSchema.safeParse(manifest);
    expect(result.success).toBe(true);
  });

  it("rejects manifest without pages", () => {
    const manifest = { theme: { flavor: "neutral" } };
    const result = manifestConfigSchema.safeParse(manifest);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("pages");
    }
  });

  it("rejects page with empty content array", () => {
    const manifest = {
      pages: {
        "/home": { content: [] },
      },
    };
    const result = manifestConfigSchema.safeParse(manifest);
    expect(result.success).toBe(false);
  });

  it("rejects invalid auth screen name", () => {
    const manifest = {
      auth: { screens: ["not-a-screen"] },
      pages: {
        "/home": { content: [{ type: "heading", text: "Hi" }] },
      },
    };
    const result = manifestConfigSchema.safeParse(manifest);
    expect(result.success).toBe(false);
  });

  it("rejects invalid page layout", () => {
    const manifest = {
      pages: {
        "/home": {
          layout: "invalid-layout",
          content: [{ type: "heading", text: "Hi" }],
        },
      },
    };
    const result = manifestConfigSchema.safeParse(manifest);
    expect(result.success).toBe(false);
  });

  it("reports error path for nested issues", () => {
    const manifest = {
      pages: {
        "/home": {
          content: [{ type: "heading" }], // missing required 'text'
        },
      },
    };
    const result = manifestConfigSchema.safeParse(manifest);
    // heading requires text — the superRefine should flag this
    expect(result.success).toBe(false);
  });

  it("accepts nav items with children", () => {
    const manifest = {
      nav: [
        {
          label: "Parent",
          path: "/parent",
          children: [{ label: "Child", path: "/parent/child" }],
        },
      ],
      pages: {
        "/parent": { content: [{ type: "heading", text: "Parent" }] },
      },
    };
    const result = manifestConfigSchema.safeParse(manifest);
    expect(result.success).toBe(true);
  });

  it("accepts theme with overrides", () => {
    const manifest = {
      theme: {
        flavor: "neutral",
        overrides: {
          radius: "lg",
          spacing: "compact",
        },
        mode: "dark",
      },
      pages: {
        "/home": { content: [{ type: "heading", text: "Hi" }] },
      },
    };
    const result = manifestConfigSchema.safeParse(manifest);
    expect(result.success).toBe(true);
  });
});
