// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PresenceIndicator } from "../component";

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
}));

describe("PresenceIndicator", () => {
  it("renders status label and dot", () => {
    render(
      <PresenceIndicator
        config={{
          type: "presence-indicator",
          status: "online",
          label: "Ada",
        }}
      />,
    );

    expect(screen.getByTestId("presence-indicator")).toBeTruthy();
    expect(screen.getByTestId("presence-label").textContent).toBe("Ada");
    expect(screen.getByTestId("presence-dot")).toBeTruthy();
  });
});
