// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { SnapshotImage } from "../component";
import type { SnapshotImageConfig } from "../types";

function baseConfig(
  overrides: Partial<SnapshotImageConfig> = {},
): SnapshotImageConfig {
  return {
    type: "image",
    src: "/uploads/cover.jpg",
    width: 1200,
    quality: 75,
    format: "original",
    priority: false,
    placeholder: "empty",
    alt: "Cover image",
    ...overrides,
  };
}

beforeEach(() => {
  document.head.innerHTML = "";
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.head.innerHTML = "";
});

describe("SnapshotImage component", () => {
  it("renders an img element", () => {
    render(<SnapshotImage config={baseConfig()} />);
    const img = screen.getByTestId("snapshot-image");
    expect(img).not.toBeNull();
    expect(img.tagName.toLowerCase()).toBe("img");
  });

  it("renders with data-snapshot-component attribute", () => {
    const { container } = render(<SnapshotImage config={baseConfig()} />);
    expect(container.querySelector('[data-snapshot-component="image"]')).not.toBeNull();
  });

  it("constructs src URL with correct query params", () => {
    render(
      <SnapshotImage
        config={baseConfig({ width: 800, format: "webp", quality: 80 })}
      />,
    );
    const img = screen.getByTestId("snapshot-image") as HTMLImageElement;
    expect(img.src).toContain("/_snapshot/image");
    expect(img.src).toContain("url=%2Fuploads%2Fcover.jpg");
    expect(img.src).toContain("w=800");
    expect(img.src).toContain("f=webp");
    expect(img.src).toContain("q=80");
  });

  it("includes height in URL when provided", () => {
    render(<SnapshotImage config={baseConfig({ width: 1200, height: 630 })} />);
    const img = screen.getByTestId("snapshot-image") as HTMLImageElement;
    expect(img.src).toContain("h=630");
  });

  it("omits height from URL when not provided", () => {
    render(<SnapshotImage config={baseConfig({ width: 1200 })} />);
    const img = screen.getByTestId("snapshot-image") as HTMLImageElement;
    expect(img.src).not.toContain("h=");
  });

  it("sets loading=lazy by default", () => {
    render(<SnapshotImage config={baseConfig({ priority: false })} />);
    const img = screen.getByTestId("snapshot-image");
    expect(img.getAttribute("loading")).toBe("lazy");
  });

  it("sets loading=eager when priority=true", () => {
    render(<SnapshotImage config={baseConfig({ priority: true })} />);
    const img = screen.getByTestId("snapshot-image");
    expect(img.getAttribute("loading")).toBe("eager");
  });

  it("sets alt attribute", () => {
    render(<SnapshotImage config={baseConfig({ alt: "My image" })} />);
    const img = screen.getByTestId("snapshot-image");
    expect(img.getAttribute("alt")).toBe("My image");
  });

  it("sets sizes attribute when provided", () => {
    render(
      <SnapshotImage
        config={baseConfig({ sizes: "(max-width: 768px) 100vw, 50vw" })}
      />,
    );
    const img = screen.getByTestId("snapshot-image");
    expect(img.getAttribute("sizes")).toBe("(max-width: 768px) 100vw, 50vw");
  });

  it("generates srcset with 0.5x, 1x, and 2x widths", () => {
    render(<SnapshotImage config={baseConfig({ width: 800 })} />);
    const img = screen.getByTestId("snapshot-image");
    const srcset = img.getAttribute("srcset") ?? "";
    // Should contain three entries
    const entries = srcset.split(",").map((s) => s.trim());
    expect(entries.length).toBe(3);
    // Should contain w=400 (0.5x), w=800 (1x), w=1600 (2x)
    expect(srcset).toContain("w=400");
    expect(srcset).toContain("w=800");
    expect(srcset).toContain("w=1600");
  });

  it("caps srcset double-width at 4096", () => {
    render(<SnapshotImage config={baseConfig({ width: 3000 })} />);
    const img = screen.getByTestId("snapshot-image");
    const srcset = img.getAttribute("srcset") ?? "";
    // 3000 * 2 = 6000 → capped at 4096
    expect(srcset).toContain("w=4096");
  });

  it("applies className to wrapper div", () => {
    const { container } = render(
      <SnapshotImage
        config={baseConfig({
          className: "my-image-wrapper",
          slots: {
            root: { className: "slot-root" },
          },
        })}
      />,
    );
    const wrapper = container.querySelector('[data-snapshot-component="image"]');
    expect(wrapper?.className).toContain("my-image-wrapper");
    expect(wrapper?.className).toContain("slot-root");
  });

  it("does not render placeholder div when placeholder=empty", () => {
    render(<SnapshotImage config={baseConfig({ placeholder: "empty" })} />);
    expect(screen.queryByTestId("snapshot-image-placeholder")).toBeNull();
  });

  it("renders placeholder div when placeholder=blur", () => {
    render(<SnapshotImage config={baseConfig({ placeholder: "blur" })} />);
    expect(screen.getByTestId("snapshot-image-placeholder")).not.toBeNull();
  });

  it("placeholder becomes invisible after image loads", () => {
    render(<SnapshotImage config={baseConfig({ placeholder: "blur" })} />);
    const placeholder = screen.getByTestId(
      "snapshot-image-placeholder",
    ) as HTMLElement;
    const img = screen.getByTestId("snapshot-image");

    // Initially visible (opacity: 1)
    expect(placeholder.style.opacity).toBe("1");

    // Simulate image load
    fireEvent.load(img);

    // Placeholder fades out (opacity: 0)
    expect(placeholder.style.opacity).toBe("0");
  });

  it("injects a preload link when priority=true", () => {
    const appendSpy = vi.spyOn(document.head, "appendChild");
    render(<SnapshotImage config={baseConfig({ priority: true })} />);
    expect(appendSpy).toHaveBeenCalled();
    const call = appendSpy.mock.calls.find(
      ([el]) => (el as HTMLElement).tagName === "LINK",
    );
    expect(call).toBeDefined();
    const link = call![0] as HTMLLinkElement;
    expect(link.rel).toBe("preload");
    expect(link.as).toBe("image");
    appendSpy.mockRestore();
  });

  it("does not inject preload link when priority=false", () => {
    const appendSpy = vi.spyOn(document.head, "appendChild");
    render(<SnapshotImage config={baseConfig({ priority: false })} />);
    const linkCalls = appendSpy.mock.calls.filter(
      ([el]) => (el as HTMLElement).tagName === "LINK",
    );
    expect(linkCalls.length).toBe(0);
    appendSpy.mockRestore();
  });
});
