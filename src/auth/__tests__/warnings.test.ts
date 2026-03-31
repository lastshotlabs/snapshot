import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { _resetWarnings, warnOnce } from "../warnings";

describe("warnOnce", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    _resetWarnings();
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    // Ensure dev mode
    vi.stubEnv("NODE_ENV", "development");
  });

  afterEach(() => {
    warnSpy.mockRestore();
    vi.unstubAllEnvs();
  });

  it("emits warning on first call", () => {
    warnOnce("test-key", "test message");
    expect(warnSpy).toHaveBeenCalledWith("test message");
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it("deduplicates by key — only warns once", () => {
    warnOnce("test-key", "test message");
    warnOnce("test-key", "test message");
    warnOnce("test-key", "test message");
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it("different keys each warn independently", () => {
    warnOnce("key-a", "message a");
    warnOnce("key-b", "message b");
    expect(warnSpy).toHaveBeenCalledTimes(2);
  });

  it("no-ops in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    warnOnce("prod-key", "should not warn");
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("_resetWarnings allows re-warning after reset", () => {
    warnOnce("test-key", "first");
    expect(warnSpy).toHaveBeenCalledTimes(1);
    _resetWarnings();
    warnOnce("test-key", "second");
    expect(warnSpy).toHaveBeenCalledTimes(2);
  });
});
