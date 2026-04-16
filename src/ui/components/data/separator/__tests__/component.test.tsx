// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Separator } from "../component";

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
  usePublish: () => vi.fn(),
}));

describe("Separator", () => {
  it("renders a labeled horizontal separator", () => {
    const { container } = render(
      <Separator
        config={{
          type: "separator",
          label: "Continue",
          className: "component-root",
          slots: {
            root: { className: "slot-root" },
          },
        }}
      />,
    );

    expect(container.querySelector('[data-snapshot-component="separator"]')?.className).toContain("component-root");
    expect(container.querySelector('[data-snapshot-component="separator"]')?.className).toContain("slot-root");
    expect(screen.getByText("Continue")).toBeTruthy();
    expect(screen.getByRole("separator").getAttribute("aria-orientation")).toBe("horizontal");
  });
});
