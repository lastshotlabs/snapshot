import { describe, it, expect } from "vitest";
import {
  getNestedValue,
  isFromRef,
  parseDataString,
  extractFromRefs,
  applyResolved,
} from "../utils";

describe("getNestedValue", () => {
  it("returns a simple top-level field", () => {
    expect(getNestedValue({ name: "Alice" }, "name")).toBe("Alice");
  });

  it("returns a deeply nested field", () => {
    const obj = { a: { b: { c: 42 } } };
    expect(getNestedValue(obj, "a.b.c")).toBe(42);
  });

  it("returns undefined for missing paths", () => {
    expect(getNestedValue({ a: 1 }, "b")).toBeUndefined();
    expect(getNestedValue({ a: 1 }, "a.b.c")).toBeUndefined();
  });

  it("returns undefined when traversing through null", () => {
    expect(getNestedValue({ a: null }, "a.b")).toBeUndefined();
  });

  it("returns undefined when traversing through undefined", () => {
    expect(getNestedValue({ a: undefined }, "a.b")).toBeUndefined();
  });

  it("returns undefined for non-object root", () => {
    expect(getNestedValue("string", "length")).toBeUndefined();
    expect(getNestedValue(42, "foo")).toBeUndefined();
  });

  it("returns undefined for null root", () => {
    expect(getNestedValue(null, "foo")).toBeUndefined();
  });

  it("handles array index access via dot path", () => {
    const obj = { items: [10, 20, 30] };
    expect(getNestedValue(obj, "items.1")).toBe(20);
  });
});

describe("isFromRef", () => {
  it("returns true for valid FromRef", () => {
    expect(isFromRef({ from: "users-table.selected" })).toBe(true);
    expect(isFromRef({ from: "global.user" })).toBe(true);
  });

  it("returns false for strings", () => {
    expect(isFromRef("hello")).toBe(false);
  });

  it("returns false for numbers", () => {
    expect(isFromRef(42)).toBe(false);
  });

  it("returns false for null", () => {
    expect(isFromRef(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isFromRef(undefined)).toBe(false);
  });

  it("returns false for objects without from", () => {
    expect(isFromRef({ to: "somewhere" })).toBe(false);
  });

  it("returns false when from is not a string", () => {
    expect(isFromRef({ from: 42 })).toBe(false);
    expect(isFromRef({ from: null })).toBe(false);
  });

  it("returns false for arrays", () => {
    expect(isFromRef([1, 2, 3])).toBe(false);
  });
});

describe("parseDataString", () => {
  it('parses "GET /api/users" into method and endpoint', () => {
    expect(parseDataString("GET /api/users")).toEqual(["GET", "/api/users"]);
  });

  it('parses "POST /api/users" into method and endpoint', () => {
    expect(parseDataString("POST /api/users")).toEqual(["POST", "/api/users"]);
  });

  it("defaults to GET when no method specified", () => {
    expect(parseDataString("/api/users")).toEqual(["GET", "/api/users"]);
  });

  it("handles DELETE method", () => {
    expect(parseDataString("DELETE /api/users/1")).toEqual([
      "DELETE",
      "/api/users/1",
    ]);
  });

  it("handles endpoints with query params", () => {
    expect(parseDataString("GET /api/users?page=1")).toEqual([
      "GET",
      "/api/users?page=1",
    ]);
  });
});

describe("extractFromRefs", () => {
  it("extracts top-level FromRefs", () => {
    const obj = {
      userId: { from: "users-table.selected.id" },
      label: "static",
    };
    const refs = extractFromRefs(obj);
    expect(refs.size).toBe(1);
    expect(refs.get("userId")).toEqual({ from: "users-table.selected.id" });
  });

  it("extracts nested FromRefs", () => {
    const obj = {
      params: {
        id: { from: "users-table.selected.id" },
        period: { from: "date-range" },
      },
    };
    const refs = extractFromRefs(obj);
    expect(refs.size).toBe(2);
    expect(refs.get("params.id")).toEqual({
      from: "users-table.selected.id",
    });
    expect(refs.get("params.period")).toEqual({ from: "date-range" });
  });

  it("extracts FromRefs inside arrays", () => {
    const obj = {
      items: [{ from: "a" }, "static", { from: "b" }],
    };
    const refs = extractFromRefs(obj);
    expect(refs.size).toBe(2);
    expect(refs.get("items.0")).toEqual({ from: "a" });
    expect(refs.get("items.2")).toEqual({ from: "b" });
  });

  it("returns empty map for objects without FromRefs", () => {
    const refs = extractFromRefs({ a: 1, b: "hello" });
    expect(refs.size).toBe(0);
  });

  it("returns empty map for null", () => {
    expect(extractFromRefs(null).size).toBe(0);
  });

  it("returns empty map for primitives", () => {
    expect(extractFromRefs("string").size).toBe(0);
    expect(extractFromRefs(42).size).toBe(0);
  });
});

describe("applyResolved", () => {
  it("replaces top-level FromRefs with resolved values", () => {
    const config = {
      userId: { from: "users-table.selected.id" },
      label: "static",
    };
    const resolved = new Map<string, unknown>([["userId", 5]]);
    const result = applyResolved(config, resolved);
    expect(result).toEqual({ userId: 5, label: "static" });
  });

  it("replaces nested FromRefs", () => {
    const config = {
      params: {
        id: { from: "users-table.selected.id" },
      },
      title: "Page",
    };
    const resolved = new Map<string, unknown>([["params.id", 42]]);
    const result = applyResolved(config, resolved);
    expect(result).toEqual({ params: { id: 42 }, title: "Page" });
  });

  it("replaces FromRefs inside arrays", () => {
    const config = {
      items: [{ from: "a" }, "static"],
    };
    const resolved = new Map<string, unknown>([["items.0", "resolved-a"]]);
    const result = applyResolved(config, resolved);
    expect(result).toEqual({ items: ["resolved-a", "static"] });
  });

  it("does not mutate the original config", () => {
    const config = { userId: { from: "x" } };
    const resolved = new Map<string, unknown>([["userId", 10]]);
    const result = applyResolved(config, resolved);
    expect(config.userId).toEqual({ from: "x" });
    expect(result).toEqual({ userId: 10 });
  });

  it("passes through primitives unchanged", () => {
    expect(applyResolved("hello", new Map())).toBe("hello");
    expect(applyResolved(42, new Map())).toBe(42);
    expect(applyResolved(null, new Map())).toBeNull();
  });
});
