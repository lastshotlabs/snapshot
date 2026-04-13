// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Vote } from "../component";

const executeSpy = vi.fn();

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => executeSpy,
}));

describe("Vote", () => {
  it("updates the displayed score when upvoted", () => {
    render(
      <Vote
        config={{
          type: "vote",
          value: 10,
          upAction: { type: "upvote" } as never,
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Upvote" }));

    expect(screen.getByText("11")).toBeTruthy();
    expect(executeSpy).toHaveBeenCalledWith({ type: "upvote" });
  });
});
