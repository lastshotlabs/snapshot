// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TypingIndicator } from "../component";

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
}));

describe("TypingIndicator", () => {
  it("renders typing text for multiple users", () => {
    render(
      <TypingIndicator
        config={{
          type: "typing-indicator",
          users: [{ name: "Ada" }, { name: "Lin" }],
        }}
      />,
    );

    expect(screen.getByTestId("typing-indicator")).toBeTruthy();
    expect(screen.getByTestId("typing-text").textContent).toContain(
      "Ada and Lin are typing",
    );
  });
});
