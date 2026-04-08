import { describe, it, expect } from "vitest";
import { generateManifestJson } from "../templates/manifest-init";
import type { ManifestInitOptions } from "../templates/manifest-init";

// Import schema + register built-in component schemas (side-effect)
import { manifestConfigSchema } from "../../ui/manifest/schema";

const baseOptions: ManifestInitOptions = {
  flavor: "neutral",
  includeAuth: true,
  includeSidebar: true,
};

describe("generateManifestJson", () => {
  it("returns valid JSON", () => {
    const json = generateManifestJson(baseOptions);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it("generated JSON validates against manifestConfigSchema", () => {
    const json = generateManifestJson(baseOptions);
    const parsed = JSON.parse(json);
    const result = manifestConfigSchema.safeParse(parsed);

    if (!result.success) {
      // Surface Zod errors for debugging
      throw new Error(
        `Schema validation failed:\n${result.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n")}`,
      );
    }

    expect(result.success).toBe(true);
  });

  it("sets theme.flavor from options", () => {
    const json = generateManifestJson({ ...baseOptions, flavor: "violet" });
    const parsed = JSON.parse(json);
    expect(parsed.theme.flavor).toBe("violet");
  });

  it("changes flavor correctly for each option", () => {
    for (const flavor of ["neutral", "slate", "midnight", "rose"]) {
      const parsed = JSON.parse(
        generateManifestJson({ ...baseOptions, flavor }),
      );
      expect(parsed.theme.flavor).toBe(flavor);
    }
  });

  it("includes auth section when includeAuth is true", () => {
    const parsed = JSON.parse(
      generateManifestJson({ ...baseOptions, includeAuth: true }),
    );
    expect(parsed.auth).toBeDefined();
    expect(parsed.auth.screens).toContain("login");
    expect(parsed.auth.screens).toContain("register");
  });

  it("excludes auth section when includeAuth is false", () => {
    const parsed = JSON.parse(
      generateManifestJson({ ...baseOptions, includeAuth: false }),
    );
    expect(parsed.auth).toBeUndefined();
  });

  it("includes nav items when includeSidebar is true", () => {
    const parsed = JSON.parse(
      generateManifestJson({ ...baseOptions, includeSidebar: true }),
    );
    expect(parsed.navigation).toBeDefined();
    expect(parsed.navigation.items.length).toBeGreaterThanOrEqual(2);
    expect(parsed.navigation.items[0].path).toBe("/dashboard");
  });

  it("excludes nav items when includeSidebar is false", () => {
    const parsed = JSON.parse(
      generateManifestJson({ ...baseOptions, includeSidebar: false }),
    );
    expect(parsed.navigation).toBeUndefined();
  });

  it("uses sidebar layout when includeSidebar is true", () => {
    const parsed = JSON.parse(
      generateManifestJson({ ...baseOptions, includeSidebar: true }),
    );
    expect(parsed.routes[0].layout).toBe("sidebar");
    expect(parsed.routes[1].layout).toBe("sidebar");
  });

  it("uses minimal layout when includeSidebar is false", () => {
    const parsed = JSON.parse(
      generateManifestJson({ ...baseOptions, includeSidebar: false }),
    );
    expect(parsed.routes[0].layout).toBe("minimal");
    expect(parsed.routes[1].layout).toBe("minimal");
  });

  it("always includes /dashboard and /settings pages", () => {
    const parsed = JSON.parse(
      generateManifestJson({
        ...baseOptions,
        includeAuth: false,
        includeSidebar: false,
      }),
    );
    expect(parsed.routes.find((route: { path: string }) => route.path === "/dashboard")).toBeDefined();
    expect(parsed.routes.find((route: { path: string }) => route.path === "/settings")).toBeDefined();
  });

  it("includes heading and row components in dashboard", () => {
    const parsed = JSON.parse(generateManifestJson(baseOptions));
    const dashboard = parsed.routes.find(
      (route: { path: string; content: unknown[] }) => route.path === "/dashboard",
    );
    const content = dashboard.content;
    expect(content.some((c: { type: string }) => c.type === "heading")).toBe(
      true,
    );
    const row = content.find((c: { type: string }) => c.type === "row");
    expect(row).toBeDefined();
    expect(row.children.length).toBeGreaterThanOrEqual(1);
  });

  it("all option combinations produce schema-valid output", () => {
    const combos = [
      { flavor: "neutral", includeAuth: false, includeSidebar: false },
      { flavor: "violet", includeAuth: true, includeSidebar: false },
      { flavor: "emerald", includeAuth: false, includeSidebar: true },
      { flavor: "sunset", includeAuth: true, includeSidebar: true },
    ];

    for (const opts of combos) {
      const parsed = JSON.parse(generateManifestJson(opts));
      const result = manifestConfigSchema.safeParse(parsed);
      expect(result.success).toBe(true);
    }
  });
});
