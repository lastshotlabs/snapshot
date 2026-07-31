// @vitest-environment happy-dom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { useInfiniteScroll } from "../use-infinite-scroll";

class MockIntersectionObserver {
  static callback: IntersectionObserverCallback | undefined;

  constructor(callback: IntersectionObserverCallback) {
    MockIntersectionObserver.callback = callback;
  }

  observe() {}

  disconnect() {}
}

function TestHarness({
  hasNextPage = true,
  isLoading = false,
  loadNextPage,
}: {
  hasNextPage?: boolean;
  isLoading?: boolean;
  loadNextPage: () => void;
}) {
  const ref = useInfiniteScroll({
    hasNextPage,
    isLoading,
    loadNextPage,
    threshold: 120,
  });

  return <div ref={ref} data-testid="sentinel" />;
}

describe("useInfiniteScroll", () => {
  beforeEach(() => {
    MockIntersectionObserver.callback = undefined;
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    cleanup();
  });

  it("loads the next page when the sentinel enters the viewport", () => {
    const loadNextPage = vi.fn();
    render(<TestHarness loadNextPage={loadNextPage} />);

    MockIntersectionObserver.callback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );

    expect(loadNextPage).toHaveBeenCalledTimes(1);
  });

  it("does not observe while loading", () => {
    const loadNextPage = vi.fn();
    render(<TestHarness loadNextPage={loadNextPage} isLoading />);

    expect(MockIntersectionObserver.callback).toBeUndefined();
  });
});
