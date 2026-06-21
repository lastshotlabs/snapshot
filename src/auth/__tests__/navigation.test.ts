/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { setRuntimeNavigator, navigateToPath } from "../navigation";

afterEach(() => {
  // Registration is per-process — reset so tests don't leak into each other.
  setRuntimeNavigator(null);
  vi.restoreAllMocks();
});

describe("navigateToPath", () => {
  it("calls the registered runtime navigator and does not touch history", () => {
    const nav = vi.fn();
    setRuntimeNavigator(nav);
    const push = vi.spyOn(window.history, "pushState");

    navigateToPath("/dashboard", { replace: false });

    expect(nav).toHaveBeenCalledWith("/dashboard", { replace: false });
    expect(push).not.toHaveBeenCalled();
  });

  it("forwards the replace flag to the navigator", () => {
    const nav = vi.fn();
    setRuntimeNavigator(nav);

    navigateToPath("/login", { replace: true });

    expect(nav).toHaveBeenCalledWith("/login", { replace: true });
  });

  it("falls back to pushState + a popstate event when no navigator is set", () => {
    const push = vi.spyOn(window.history, "pushState");
    const dispatch = vi.spyOn(window, "dispatchEvent");

    navigateToPath("/feed");

    expect(push).toHaveBeenCalledTimes(1);
    expect(push.mock.calls[0]?.[2]).toBe("/feed");
    const popstate = dispatch.mock.calls.find(
      ([e]) => e instanceof PopStateEvent,
    )?.[0];
    expect(popstate).toBeInstanceOf(PopStateEvent);
  });

  it("uses replaceState in the fallback path when replace is true", () => {
    const replace = vi.spyOn(window.history, "replaceState");

    navigateToPath("/replaced", { replace: true });

    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace.mock.calls[0]?.[2]).toBe("/replaced");
  });

  it("is a no-op when `to` is undefined", () => {
    const nav = vi.fn();
    setRuntimeNavigator(nav);
    const push = vi.spyOn(window.history, "pushState");

    navigateToPath(undefined);

    expect(nav).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });
});
