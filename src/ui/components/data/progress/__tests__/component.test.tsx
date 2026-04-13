// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Progress } from "../component";

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
  usePublish: () => vi.fn(),
}));

describe("Progress", () => {
  it("renders label and percentage for the bar variant", () => {
    render(
      <Progress
        config={{
          type: "progress",
          value: 65,
          label: "Upload",
          showValue: true,
        }}
      />,
    );

    expect(screen.getByTestId("progress")).toBeTruthy();
    expect(screen.getByText("Upload")).toBeTruthy();
    expect(screen.getByText("65%")).toBeTruthy();
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("65");
  });
});
