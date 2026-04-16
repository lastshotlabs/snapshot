// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Vote } from "../component";

const executeSpy = vi.fn();

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => executeSpy,
}));

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
}));

describe("Vote", () => {
  it("updates the displayed score when upvoted", () => {
    const { container } = render(
      <Vote
        config={{
          type: "vote",
          id: "vote-demo",
          className: "vote-root",
          value: 10,
          upAction: { type: "upvote" } as never,
        }}
      />,
    );

    expect(
      container.querySelector('[data-snapshot-id="vote-demo"]')?.className,
    ).toContain("vote-root");

    fireEvent.click(screen.getByRole("button", { name: "Upvote" }));

    expect(screen.getByText("11")).toBeTruthy();
    expect(executeSpy).toHaveBeenCalledWith({ type: "upvote" });
  });
});
