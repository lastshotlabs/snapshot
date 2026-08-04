import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { GifPickerBase } from "../standalone";

/**
 * `attribution` renders as CHILDREN, so it accepts any node.
 *
 * It was typed `string` while the implementation already did `{attribution}`.
 * That mismatch is not cosmetic: every GIF provider a real integration can use
 * requires attribution as a LINKED LOGO — KLIPY and Giphy both ask for the
 * wordmark plus a link back — so the markup the terms require was a type error,
 * and integrators worked around it by rendering their own element outside the
 * picker, which loses the attribution surface's hairline and padding.
 *
 * These tests pin the widened contract so it cannot narrow back.
 */

afterEach(cleanup);

describe("GifPickerBase attribution", () => {
  it("renders a plain string, the pre-existing usage", () => {
    render(<GifPickerBase attribution="Powered by KLIPY" />);
    expect(screen.getByText("Powered by KLIPY")).toBeTruthy();
  });

  it("renders a linked wordmark — the shape the provider terms actually ask for", () => {
    render(
      <GifPickerBase
        attribution={
          <a href="https://klipy.com">
            <img src="/brand/klipy-wordmark.svg" alt="KLIPY" />
          </a>
        }
      />,
    );
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("https://klipy.com");
    expect(screen.getByAltText("KLIPY")).toBeTruthy();
  });

  it("omits the attribution surface entirely when nothing is supplied", () => {
    const { container } = render(<GifPickerBase />);
    expect(
      container.querySelector('[data-snapshot-id="gif-picker-attribution"]'),
    ).toBeNull();
  });
});
