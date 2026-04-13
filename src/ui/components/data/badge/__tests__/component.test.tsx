// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Badge } from "../component";

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
  usePublish: () => vi.fn(),
}));

describe("Badge", () => {
  it("renders icon and dot variant", () => {
    render(
      <Badge
        config={{
          type: "badge",
          text: "Active",
          variant: "dot",
          icon: "check",
        }}
      />,
    );

    expect(screen.getByTestId("badge").textContent).toContain("Active");
    expect(screen.getByTestId("badge-dot")).toBeTruthy();
    expect(screen.getByTestId("badge-icon")).toBeTruthy();
  });
});
