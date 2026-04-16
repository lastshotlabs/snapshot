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
    const { container } = render(
      <AvatarGroup
        config={{
          type: "avatar-group",
          id: "assignees",
          className: "avatar-group-root",
          avatars: [
            { name: "Ada" },
            { name: "Lin" },
            { name: "Grace" },
          ],
          max: 2,
          slots: {
            root: { className: "avatar-group-root-slot" },
          },
        }}
      />,
    );

    expect(
      container.querySelector('[data-snapshot-id="assignees"]')?.className,
    ).toContain("avatar-group-root");
    expect(
      container.querySelector('[data-snapshot-id="assignees"]')?.className,
    ).toContain("avatar-group-root-slot");
    expect(screen.getByTestId("avatar-group")).toBeTruthy();
    expect(screen.getByTestId("avatar-overflow").textContent).toBe("+1");
  });
});
