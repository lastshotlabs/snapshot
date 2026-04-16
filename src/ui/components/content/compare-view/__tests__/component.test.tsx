// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CompareView } from "../component";

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
}));

describe("CompareView", () => {
  it("renders both panes and diff labels", () => {
    render(
      <CompareView
        config={{
          type: "compare-view",
          id: "diff-view",
          className: "compare-root",
          left: "one\ntwo",
          right: "one\nthree",
          leftLabel: "Before",
          rightLabel: "After",
          maxHeight: "240px",
        }}
      />,
    );

    expect(screen.getByTestId("compare-view")).toBeTruthy();
    expect(
      screen.getByTestId("compare-view").classList.contains("compare-root"),
    ).toBe(true);
    expect(
      (screen.getByTestId("compare-view") as HTMLElement).style.maxHeight,
    ).toBe("");
    expect(
      (screen.getByTestId("compare-left") as HTMLElement).style.maxHeight,
    ).toBe("240px");
    expect(
      (screen.getByTestId("compare-right") as HTMLElement).style.maxHeight,
    ).toBe("240px");
    expect(screen.getByTestId("compare-left-label").textContent).toBe("Before");
    expect(screen.getByTestId("compare-right-label").textContent).toBe("After");
    expect(screen.getByTestId("compare-right").textContent).toContain("three");
  });
});
