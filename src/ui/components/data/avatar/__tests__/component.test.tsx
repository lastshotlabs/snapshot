// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Avatar } from "../component";

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
  usePublish: () => vi.fn(),
}));

describe("Avatar", () => {
  it("renders initials fallback and status dot", () => {
    render(
      <Avatar
        config={{
          type: "avatar",
          name: "Jane Doe",
          status: "online",
        }}
      />,
    );

    expect(screen.getByTestId("avatar-initials").textContent).toBe("JD");
    expect(screen.getByTestId("avatar-status").getAttribute("data-status")).toBe(
      "online",
    );
  });
});
