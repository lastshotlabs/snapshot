// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ReactionBar } from "../component";

const mockExecute = vi.fn();
const mockPublish = vi.fn();

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
  usePublish: () => mockPublish,
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => mockExecute,
}));

vi.mock("../../emoji-picker/component", () => ({
  EmojiPicker: () => <div data-testid="mock-emoji-picker">Picker</div>,
}));

describe("ReactionBar", () => {
  it("renders reactions and dispatches click actions", () => {
    render(
      <ReactionBar
        config={{
          type: "reaction-bar",
          id: "reactions",
          className: "reaction-root",
          reactions: [{ emoji: "👍", count: 2, active: true }],
          addAction: { type: "event", name: "add-reaction" } as never,
          removeAction: { type: "event", name: "remove-reaction" } as never,
        }}
      />,
    );

    expect(
      screen.getByTestId("reaction-bar").classList.contains("reaction-root"),
    ).toBe(true);

    fireEvent.click(screen.getByTestId("reaction-button"));
    expect(mockExecute).toHaveBeenCalledTimes(1);
    expect(mockPublish).toHaveBeenCalledWith({
      emoji: "👍",
      action: "remove",
    });

    fireEvent.click(screen.getByTestId("reaction-add"));
    expect(screen.getByTestId("mock-emoji-picker").textContent).toBe("Picker");
  });
});
