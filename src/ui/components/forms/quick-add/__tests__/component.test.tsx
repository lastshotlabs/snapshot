// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuickAdd } from "../component";

const executeSpy = vi.fn();
const publishSpy = vi.fn();

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
  usePublish: () => publishSpy,
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => executeSpy,
}));

vi.mock("../../../../icons/index", () => ({
  Icon: ({ name }: { name: string }) => <span data-testid="quick-add-icon">{name}</span>,
}));

describe("QuickAdd", () => {
  it("submits entered text and clears the input", () => {
    executeSpy.mockReset();
    publishSpy.mockReset();

    render(
      <QuickAdd
        config={{
          type: "quick-add",
          submitAction: { type: "create-task" } as never,
        }}
      />,
    );

    const input = screen.getByTestId("quick-add-input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Write docs" } });
    fireEvent.click(screen.getByTestId("quick-add-button"));

    expect(executeSpy).toHaveBeenCalledWith({ type: "create-task" });
    expect(input.value).toBe("");
  });
});
