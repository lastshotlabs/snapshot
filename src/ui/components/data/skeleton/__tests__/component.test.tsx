// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Skeleton } from "../component";

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
}));

describe("Skeleton", () => {
  it("renders the requested number of text skeleton lines", () => {
    const { container } = render(
      <Skeleton
        config={{
          type: "skeleton",
          className: "skeleton-root-class",
          variant: "text",
          lines: 4,
          slots: {
            root: { className: "skeleton-root-slot" },
          },
        }}
      />,
    );

    expect(screen.getByTestId("skeleton")).toBeTruthy();
    expect(screen.getByTestId("skeleton").className).toContain("skeleton-root-class");
    expect(screen.getByTestId("skeleton").className).toContain("skeleton-root-slot");
    expect(container.querySelectorAll('[data-testid="skeleton"] > div').length).toBe(4);
  });
});
