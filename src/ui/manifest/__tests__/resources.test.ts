import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildRequestUrl } from "../resources";

describe("buildRequestUrl", () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date("2026-04-10T12:34:56Z") });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("interpolates path params and date templates", () => {
    expect(
      buildRequestUrl("/api/stats/{tenantId}/{date:YYYY-MM}", {
        tenantId: "acme",
      }),
    ).toBe("/api/stats/acme/2026-04");
  });

  it("supports the default date token and preserves query params", () => {
    expect(buildRequestUrl("/api/stats/{today}", { range: "30d" })).toBe(
      "/api/stats/2026-04-10?range=30d",
    );
  });
});
