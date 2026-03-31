import { describe, expect, it } from "vitest";
import { filterPaths, matchesAnyPattern, pathPatternToRegex } from "../sync";

// ── pathPatternToRegex ───────────────────────────────────────────────────────

describe("pathPatternToRegex", () => {
  it("matches exact path", () => {
    const re = pathPatternToRegex("/users");
    expect(re.test("/users")).toBe(true);
    expect(re.test("/users/")).toBe(true);
    expect(re.test("/users/123")).toBe(false);
    expect(re.test("/other")).toBe(false);
  });

  it("matches single-segment wildcard *", () => {
    const re = pathPatternToRegex("/users/*");
    expect(re.test("/users/123")).toBe(true);
    expect(re.test("/users/abc")).toBe(true);
    expect(re.test("/users")).toBe(false);
    expect(re.test("/users/123/posts")).toBe(false);
  });

  it("matches multi-segment wildcard **", () => {
    const re = pathPatternToRegex("/admin/**");
    expect(re.test("/admin")).toBe(true);
    expect(re.test("/admin/users")).toBe(true);
    expect(re.test("/admin/users/123")).toBe(true);
    expect(re.test("/admin/users/123/suspend")).toBe(true);
    expect(re.test("/other")).toBe(false);
  });

  it("matches path with OpenAPI params like {id}", () => {
    const re = pathPatternToRegex("/users/{id}");
    expect(re.test("/users/123")).toBe(true);
    expect(re.test("/users/abc")).toBe(true);
    expect(re.test("/users")).toBe(false);
    expect(re.test("/users/123/posts")).toBe(false);
  });

  it("matches nested path with param and trailing segments", () => {
    const re = pathPatternToRegex("/users/{id}/posts");
    expect(re.test("/users/123/posts")).toBe(true);
    expect(re.test("/users/abc/posts")).toBe(true);
    expect(re.test("/users/123")).toBe(false);
    expect(re.test("/users/123/posts/456")).toBe(false);
  });

  it("handles pattern without leading slash", () => {
    const re = pathPatternToRegex("auth/**");
    expect(re.test("/auth")).toBe(true);
    expect(re.test("/auth/login")).toBe(true);
    expect(re.test("/auth/register")).toBe(true);
  });

  it("handles pattern with trailing slash", () => {
    const re = pathPatternToRegex("/users/");
    expect(re.test("/users")).toBe(true);
    expect(re.test("/users/")).toBe(true);
  });

  it("combines ** with literal segments after", () => {
    const re = pathPatternToRegex("/**/health");
    expect(re.test("/health")).toBe(true);
    expect(re.test("/internal/health")).toBe(true);
    expect(re.test("/v1/internal/health")).toBe(true);
    expect(re.test("/health/check")).toBe(false);
  });
});

// ── matchesAnyPattern ────────────────────────────────────────────────────────

describe("matchesAnyPattern", () => {
  it("returns false for empty patterns", () => {
    expect(matchesAnyPattern("/users", [])).toBe(false);
    expect(matchesAnyPattern("/users", undefined)).toBe(false);
  });

  it("returns true if any pattern matches", () => {
    expect(matchesAnyPattern("/auth/login", ["/users/**", "/auth/**"])).toBe(true);
  });

  it("returns false if no pattern matches", () => {
    expect(matchesAnyPattern("/admin/users", ["/users/**", "/auth/**"])).toBe(false);
  });
});

// ── filterPaths ──────────────────────────────────────────────────────────────

describe("filterPaths", () => {
  const paths = {
    "/auth/login": { post: {} },
    "/auth/register": { post: {} },
    "/users": { get: {} },
    "/users/{id}": { get: {} },
    "/admin/users": { get: {} },
    "/admin/users/{id}/suspend": { post: {} },
    "/internal/health": { get: {} },
  } as Record<string, any>;

  it("returns all paths when no include/exclude", () => {
    const result = filterPaths(paths);
    expect(Object.keys(result)).toHaveLength(7);
  });

  it("filters by include only", () => {
    const result = filterPaths(paths, ["/auth/**", "/users/**"]);
    expect(Object.keys(result).sort()).toEqual([
      "/auth/login",
      "/auth/register",
      "/users",
      "/users/{id}",
    ]);
  });

  it("filters by exclude only", () => {
    const result = filterPaths(paths, undefined, ["/admin/**", "/internal/**"]);
    expect(Object.keys(result).sort()).toEqual([
      "/auth/login",
      "/auth/register",
      "/users",
      "/users/{id}",
    ]);
  });

  it("applies exclude after include", () => {
    // Include everything under /users and /auth, but exclude /auth/register
    const result = filterPaths(paths, ["/auth/**", "/users/**"], ["/auth/register"]);
    expect(Object.keys(result).sort()).toEqual(["/auth/login", "/users", "/users/{id}"]);
  });

  it("returns empty when include matches nothing", () => {
    const result = filterPaths(paths, ["/nonexistent/**"]);
    expect(Object.keys(result)).toHaveLength(0);
  });

  it("returns empty when all included paths are excluded", () => {
    const result = filterPaths(paths, ["/auth/**"], ["/auth/**"]);
    expect(Object.keys(result)).toHaveLength(0);
  });
});
