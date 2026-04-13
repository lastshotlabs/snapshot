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
          variant: "text",
          lines: 4,
        }}
      />,
    );

    expect(screen.getByTestId("skeleton")).toBeTruthy();
    expect(container.querySelectorAll('[data-testid="skeleton"] > div').length).toBe(4);
  });
});
