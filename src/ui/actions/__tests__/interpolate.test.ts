// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { interpolate } from "../interpolate";

describe("interpolate", () => {
  it("replaces a simple key", () => {
    expect(interpolate("/users/{id}", { id: 42 })).toBe("/users/42");
  });

  it("replaces nested paths", () => {
    expect(interpolate("{user.name}", { user: { name: "Alice" } })).toBe(
      "Alice",
    );
  });

  it("replaces deeply nested paths", () => {
    expect(interpolate("{a.b.c}", { a: { b: { c: "deep" } } })).toBe("deep");
  });

  it("preserves missing keys", () => {
    expect(interpolate("{missing}", {})).toBe("{missing}");
  });

  it("preserves partially missing nested paths", () => {
    expect(interpolate("{user.email}", { user: { name: "A" } })).toBe(
      "{user.email}",
    );
  });

  it("replaces multiple placeholders in one string", () => {
    expect(
      interpolate("{count} users deleted from {source}", {
        count: 5,
        source: "table",
      }),
    ).toBe("5 users deleted from table");
  });

  it("handles a string with no placeholders", () => {
    expect(interpolate("no placeholders here", { a: 1 })).toBe(
      "no placeholders here",
    );
  });

  it("converts non-string values via String()", () => {
    expect(interpolate("{val}", { val: true })).toBe("true");
    expect(interpolate("{val}", { val: 0 })).toBe("0");
  });

  it("preserves null/undefined values as placeholder text", () => {
    expect(interpolate("{val}", { val: null })).toBe("{val}");
    expect(interpolate("{val}", { val: undefined })).toBe("{val}");
  });

  it("handles empty template", () => {
    expect(interpolate("", { id: 1 })).toBe("");
  });

  it("handles empty context", () => {
    expect(interpolate("/users/{id}", {})).toBe("/users/{id}");
  });
});
