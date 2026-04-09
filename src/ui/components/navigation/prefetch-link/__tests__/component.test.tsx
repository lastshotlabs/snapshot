// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createElement } from "react";
import { PrefetchLink } from "../component";

// ── Mock usePrefetchRoute ─────────────────────────────────────────────────────
// We mock the SSR prefetch module to control when prefetchRoute is called.
// vi.hoisted() ensures mockPrefetchRoute is initialized before vi.mock hoisting.

const { mockPrefetchRoute } = vi.hoisted(() => {
  const mockPrefetchRoute = vi.fn<(path: string) => void>();
  return { mockPrefetchRoute };
});

vi.mock("../../../../../ssr/prefetch", () => {
  return {
    usePrefetchRoute: () => mockPrefetchRoute,
  };
});

// ── Mock IntersectionObserver ─────────────────────────────────────────────────

type IntersectionCallback = (entries: IntersectionObserverEntry[]) => void;

let observerCallback: IntersectionCallback | null = null;
let observedElement: Element | null = null;

class MockIntersectionObserver {
  private callback: IntersectionCallback;

  constructor(cb: IntersectionCallback) {
    this.callback = cb;
    observerCallback = cb;
  }

  observe(element: Element) {
    observedElement = element;
  }

  disconnect() {
    observerCallback = null;
    observedElement = null;
  }
}

beforeEach(() => {
  vi.clearAllMocks();
  observerCallback = null;
  observedElement = null;
  // Install mock IntersectionObserver
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("PrefetchLink", () => {
  it("renders an anchor with the correct href", () => {
    render(createElement(PrefetchLink, { to: "/posts" }));
    const anchor = screen.getByRole("link");
    expect(anchor.getAttribute("href")).toBe("/posts");
  });

  it("renders children inside the anchor", () => {
    render(createElement(PrefetchLink, { to: "/posts" }, "Read Posts"));
    expect(screen.getByText("Read Posts")).toBeDefined();
  });

  it("forwards className to the anchor", () => {
    const { container } = render(
      createElement(PrefetchLink, { to: "/posts", className: "nav-link" }),
    );
    expect(container.querySelector(".nav-link")).not.toBeNull();
  });

  it("forwards target to the anchor", () => {
    render(createElement(PrefetchLink, { to: "/posts", target: "_blank" }));
    const anchor = screen.getByRole("link");
    expect(anchor.getAttribute("target")).toBe("_blank");
  });

  it("forwards rel to the anchor", () => {
    render(
      createElement(PrefetchLink, {
        to: "/posts",
        rel: "noopener noreferrer",
      }),
    );
    const anchor = screen.getByRole("link");
    expect(anchor.getAttribute("rel")).toBe("noopener noreferrer");
  });

  describe("prefetch='hover' (default)", () => {
    it("calls prefetchRoute on mouseenter", () => {
      render(createElement(PrefetchLink, { to: "/posts" }));
      fireEvent.mouseEnter(screen.getByRole("link"));
      expect(mockPrefetchRoute).toHaveBeenCalledOnce();
      expect(mockPrefetchRoute).toHaveBeenCalledWith("/posts");
    });

    it("calls prefetchRoute with correct path on mouseenter", () => {
      render(
        createElement(PrefetchLink, {
          to: "/posts/hello-world",
          prefetch: "hover",
        }),
      );
      fireEvent.mouseEnter(screen.getByRole("link"));
      expect(mockPrefetchRoute).toHaveBeenCalledWith("/posts/hello-world");
    });

    it("does not trigger prefetch on click without hover", () => {
      render(createElement(PrefetchLink, { to: "/posts" }));
      fireEvent.click(screen.getByRole("link"));
      expect(mockPrefetchRoute).not.toHaveBeenCalled();
    });
  });

  describe("prefetch='none'", () => {
    it("does not call prefetchRoute on mouseenter when prefetch='none'", () => {
      render(createElement(PrefetchLink, { to: "/posts", prefetch: "none" }));
      fireEvent.mouseEnter(screen.getByRole("link"));
      expect(mockPrefetchRoute).not.toHaveBeenCalled();
    });

    it("does not set up IntersectionObserver when prefetch='none'", () => {
      render(createElement(PrefetchLink, { to: "/posts", prefetch: "none" }));
      expect(observedElement).toBeNull();
    });
  });

  describe("prefetch='viewport'", () => {
    it("does not call prefetchRoute on mouseenter when prefetch='viewport'", () => {
      render(
        createElement(PrefetchLink, { to: "/posts", prefetch: "viewport" }),
      );
      fireEvent.mouseEnter(screen.getByRole("link"));
      expect(mockPrefetchRoute).not.toHaveBeenCalled();
    });

    it("observes the anchor element via IntersectionObserver", () => {
      render(
        createElement(PrefetchLink, { to: "/posts", prefetch: "viewport" }),
      );
      expect(observedElement).not.toBeNull();
    });

    it("calls prefetchRoute when the element enters the viewport", () => {
      render(
        createElement(PrefetchLink, { to: "/posts", prefetch: "viewport" }),
      );
      expect(observerCallback).not.toBeNull();

      // Simulate entering viewport
      observerCallback!([
        { isIntersecting: true } as IntersectionObserverEntry,
      ]);
      expect(mockPrefetchRoute).toHaveBeenCalledOnce();
      expect(mockPrefetchRoute).toHaveBeenCalledWith("/posts");
    });

    it("does not call prefetchRoute when the element is not intersecting", () => {
      render(
        createElement(PrefetchLink, { to: "/posts", prefetch: "viewport" }),
      );
      observerCallback!([
        { isIntersecting: false } as IntersectionObserverEntry,
      ]);
      expect(mockPrefetchRoute).not.toHaveBeenCalled();
    });

    it("disconnects the observer after first intersection", () => {
      const disconnectSpy = vi.spyOn(
        MockIntersectionObserver.prototype,
        "disconnect",
      );
      render(
        createElement(PrefetchLink, { to: "/posts", prefetch: "viewport" }),
      );

      observerCallback!([
        { isIntersecting: true } as IntersectionObserverEntry,
      ]);

      expect(disconnectSpy).toHaveBeenCalled();
    });
  });
});
