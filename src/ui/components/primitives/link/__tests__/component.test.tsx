/**
 * @vitest-environment jsdom
 */
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const navigate = vi.fn();

vi.mock("../../../../context", () => ({
  useSubscribe: () => null,
  useResolveFrom: <T extends Record<string, unknown>>(value: T) => value,
}));

vi.mock("../../../../manifest/runtime", () => ({
  useManifestRuntime: () => null,
  useRouteRuntime: () => ({
    currentPath: "/current",
    navigate,
  }),
}));

import { Link } from "../component";

describe("Link", () => {
  afterEach(() => {
    cleanup();
    navigate.mockReset();
  });

  it("renders label and badge slots and navigates through route runtime", () => {
    render(
      <Link
        config={{
          type: "link",
          className: "component-root",
          text: "Dashboard",
          to: "/dashboard",
          badge: "Beta",
          external: false,
          align: "left",
          variant: "default",
          slots: {
            root: { className: "link-root-slot" },
            label: { className: "link-label-slot" },
          },
        }}
      />,
    );

    const link = screen.getByRole("link", { name: "Dashboard Beta" });
    expect(link.className).toContain("component-root");
    expect(link.className).toContain("link-root-slot");
    expect(link.getAttribute("href")).toBe("/dashboard");
    expect(screen.getByText("Dashboard").className).toContain("link-label-slot");
    expect(screen.getByText("Beta")).toBeTruthy();

    fireEvent.click(link);
    expect(navigate).toHaveBeenCalledWith("/dashboard");
  });

  it("applies canonical current-state styling for the root surface", () => {
    render(
      <Link
        config={{
          type: "link",
          text: "Current page",
          to: "/current",
          external: false,
          align: "left",
          variant: "default",
          slots: {
            root: {
              states: {
                current: {
                  className: "link-current-slot",
                },
              },
            },
          },
        }}
      />,
    );

    const link = screen.getByRole("link", { name: "Current page" });
    expect(link.className).toContain("link-current-slot");
    expect(link.getAttribute("aria-current")).toBe("page");
  });

  it("supports navigation-style links with disabled and current states", () => {
    render(
      <Link
        config={{
          type: "link",
          text: "Settings",
          to: "/current",
          external: false,
          align: "left",
          variant: "navigation",
          disabled: true,
          matchChildren: true,
        }}
      />,
    );

    const link = screen.getByRole("link", { name: "Settings" });
    expect(link.getAttribute("aria-current")).toBe("page");
    expect(link.getAttribute("aria-disabled")).toBe("true");

    fireEvent.click(link);
    expect(navigate).not.toHaveBeenCalled();
  });

  it("renders navigation links as full surfaces so root sizing applies to current state", () => {
    render(
      <div style={{ width: "18rem" }}>
        <Link
          config={{
            type: "link",
            text: "Dashboard",
            to: "/current",
            external: false,
            align: "left",
            variant: "navigation",
            slots: {
              root: {
                width: "100%",
              },
            },
          }}
        />
      </div>,
    );

    const link = screen.getByRole("link", { name: "Dashboard" });
    expect(link.style.display).toBe("flex");
    expect(link.style.width).toBe("100%");
    expect(link.style.boxSizing).toBe("border-box");
    expect(link.getAttribute("aria-current")).toBe("page");
  });

  it.each([
    ["mailto:support@example.com"],
    ["https://example.com/docs"],
    ["#details"],
  ])("lets the browser handle non-router hrefs: %s", (to) => {
    render(
      <Link
        config={{
          type: "link",
          text: "Open",
          to,
          external: false,
          align: "left",
          variant: "default",
        }}
      />,
    );

    fireEvent.click(screen.getByRole("link", { name: "Open" }));
    expect(navigate).not.toHaveBeenCalled();
  });
});
