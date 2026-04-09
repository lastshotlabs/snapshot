import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { safeJsonStringify, serializeQueryState } from "../state";

describe("safeJsonStringify", () => {
  it("escapes </script> to prevent XSS", () => {
    expect(safeJsonStringify({ x: "</script>" })).toBe('{"x":"<\\/script>"}');
  });

  it("escapes <!-- to prevent XSS", () => {
    expect(safeJsonStringify({ x: "<!--attack" })).toBe('{"x":"<\\!--attack"}');
  });

  it("does not double-escape existing escaped sequences", () => {
    const result = safeJsonStringify({ x: "<\\/" });
    expect(result).not.toContain("</\\/");
  });

  it("produces valid JSON parseable by JSON.parse", () => {
    const obj = { title: "Hello </script> world" };
    const json = safeJsonStringify(obj);
    const parsed = JSON.parse(json) as { title: string };
    expect(parsed.title).toBe("Hello </script> world");
  });

  it("handles nested objects with XSS payloads", () => {
    const obj = { nested: { bio: "</script><script>alert('xss')</script>" } };
    const json = safeJsonStringify(obj);
    expect(json).not.toContain("</script>");
    expect(JSON.parse(json)).toEqual(obj);
  });

  it("handles arrays", () => {
    const arr = ["</script>", "safe"];
    const json = safeJsonStringify(arr);
    expect(json).not.toContain("</script>");
    expect(JSON.parse(json)).toEqual(arr);
  });
});

describe("serializeQueryState", () => {
  it("returns a <script> tag with id __SNAPSHOT_QUERY_STATE__", () => {
    const qc = new QueryClient();
    const result = serializeQueryState(qc);
    expect(result).toContain('id="__SNAPSHOT_QUERY_STATE__"');
    expect(result).toContain('type="application/json"');
    expect(result).toMatch(/^<script/);
    expect(result).toMatch(/<\/script>$/);
  });

  it("empty QueryClient serializes to valid JSON with queries and mutations arrays", () => {
    const qc = new QueryClient();
    const result = serializeQueryState(qc);
    const json = result.replace(/<script[^>]*>/, "").replace(/<\/script>$/, "");
    const state = JSON.parse(json) as {
      queries: unknown[];
      mutations: unknown[];
    };
    expect(Array.isArray(state.queries)).toBe(true);
    expect(Array.isArray(state.mutations)).toBe(true);
  });

  it("seeded query data appears in serialized output", () => {
    const qc = new QueryClient();
    qc.setQueryData(["post", "nba-finals"], { title: "NBA Finals" });
    const result = serializeQueryState(qc);
    expect(result).toContain("nba-finals");
    expect(result).toContain("NBA Finals");
  });

  it("includes nonce attribute when provided", () => {
    const qc = new QueryClient();
    const result = serializeQueryState(qc, "abc123");
    expect(result).toContain('nonce="abc123"');
  });

  it("XSS-escapes data values in serialized state", () => {
    const qc = new QueryClient();
    qc.setQueryData(["bio"], { bio: "</script><script>alert(1)</script>" });
    const result = serializeQueryState(qc);
    expect(result).not.toContain("</script><script>");
    // Parseable back on client
    const json = result.replace(/<script[^>]*>/, "").replace(/<\/script>$/, "");
    expect(() => JSON.parse(json)).not.toThrow();
  });
});
