// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AvatarGroup } from "../component";

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
  usePublish: () => vi.fn(),
}));

vi.mock("../../../_base/use-component-data", () => ({
  useComponentData: () => ({ data: undefined }),
}));

describe("AvatarGroup", () => {
  it("renders overflow when max is exceeded", () => {
    render(
      <AvatarGroup
        config={{
          type: "avatar-group",
          avatars: [
            { name: "Ada" },
            { name: "Lin" },
            { name: "Grace" },
          ],
          max: 2,
        }}
      />,
    );

    expect(screen.getByTestId("avatar-group")).toBeTruthy();
    expect(screen.getByTestId("avatar-overflow").textContent).toBe("+1");
  });
});
