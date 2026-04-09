import { describe, expect, it } from "vitest";
import { resolveRoutePreloadTarget } from "../app";

describe("resolveRoutePreloadTarget", () => {
  it("passes route params through for string preload targets", () => {
    expect(
      resolveRoutePreloadTarget("user", {
        id: "42",
      }),
    ).toEqual({
      target: "user",
      params: {
        id: "42",
      },
    });
  });

  it("merges route params into resource refs while letting explicit params win", () => {
    expect(
      resolveRoutePreloadTarget(
        {
          resource: "user",
          params: {
            id: "99",
            include: "projects",
          },
        },
        {
          id: "42",
          locale: "en-US",
        },
      ),
    ).toEqual({
      target: {
        resource: "user",
        params: {
          id: "99",
          locale: "en-US",
          include: "projects",
        },
      },
    });
  });
});
