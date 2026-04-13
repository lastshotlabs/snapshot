/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

const navigate = vi.fn();

vi.mock("../../../../context", () => ({
  useSubscribe: () => null,
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
  it("renders label and badge slots and navigates through route runtime", () => {
    render(
      <Link
        config={{
          type: "link",
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

    const button = screen.getByRole("button", { name: "Dashboard Beta" });
    expect(button.className).toContain("link-root-slot");
    expect(screen.getByText("Dashboard").className).toContain("link-label-slot");
    expect(screen.getByText("Beta")).toBeTruthy();

    fireEvent.click(button);
    expect(navigate).toHaveBeenCalledWith("/dashboard");
  });
});
