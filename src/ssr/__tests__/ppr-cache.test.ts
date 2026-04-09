// src/ssr/__tests__/ppr-cache.test.ts
// Unit tests for the PPR shell cache factory.
// Uses bun:test; do NOT run — the full test suite runs after all phases land.

import { describe, expect, it, beforeEach } from "bun:test";
import { createPprCache } from "../ppr-cache";
import type { PprCache } from "../ppr-cache";
import type { PprShell } from "../ppr";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const okShell: PprShell = { shellHtml: "<div>static shell</div>", ok: true };
const failedShell: PprShell = { shellHtml: "", ok: false };

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("createPprCache", () => {
  let cache: PprCache;

  beforeEach(() => {
    cache = createPprCache();
  });

  it("returns a frozen cache object", () => {
    expect(Object.isFrozen(cache)).toBe(true);
  });

  it("starts empty — has() returns false for any path", () => {
    expect(cache.has("/")).toBe(false);
    expect(cache.has("/dashboard")).toBe(false);
  });

  it("get() returns undefined on a cache miss", () => {
    expect(cache.get("/nonexistent")).toBeUndefined();
  });

  describe("set() and get()", () => {
    it("stores and retrieves a shell by path", () => {
      cache.set("/dashboard", okShell);
      const entry = cache.get("/dashboard");
      expect(entry).toBeDefined();
      expect(entry!.shellHtml).toBe("<div>static shell</div>");
    });

    it("entry.cachedAt is a recent timestamp", () => {
      const before = Date.now();
      cache.set("/home", okShell);
      const after = Date.now();
      const entry = cache.get("/home");
      expect(entry!.cachedAt).toBeGreaterThanOrEqual(before);
      expect(entry!.cachedAt).toBeLessThanOrEqual(after);
    });

    it("has() returns true after set()", () => {
      cache.set("/posts", okShell);
      expect(cache.has("/posts")).toBe(true);
    });

    it("does NOT cache a failed shell (ok: false)", () => {
      cache.set("/broken", failedShell);
      expect(cache.has("/broken")).toBe(false);
      expect(cache.get("/broken")).toBeUndefined();
    });

    it("overwrites an existing entry for the same path", () => {
      const shellV1: PprShell = { shellHtml: "<div>version 1</div>", ok: true };
      const shellV2: PprShell = { shellHtml: "<div>version 2</div>", ok: true };

      cache.set("/route", shellV1);
      cache.set("/route", shellV2);

      const entry = cache.get("/route");
      expect(entry!.shellHtml).toBe("<div>version 2</div>");
    });

    it("caches different paths independently", () => {
      cache.set("/a", { shellHtml: "shell-a", ok: true });
      cache.set("/b", { shellHtml: "shell-b", ok: true });

      expect(cache.get("/a")!.shellHtml).toBe("shell-a");
      expect(cache.get("/b")!.shellHtml).toBe("shell-b");
    });
  });

  describe("clear()", () => {
    it("removes all cached entries", () => {
      cache.set("/x", okShell);
      cache.set("/y", okShell);
      cache.clear();
      expect(cache.has("/x")).toBe(false);
      expect(cache.has("/y")).toBe(false);
    });

    it("allows re-populating after clear()", () => {
      cache.set("/route", okShell);
      cache.clear();
      cache.set("/route", okShell);
      expect(cache.has("/route")).toBe(true);
    });
  });
});
