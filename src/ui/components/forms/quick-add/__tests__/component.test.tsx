// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
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

afterEach(() => {
  cleanup();
});

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

  it("applies canonical quick-add slots", () => {
    const { container } = render(
      <QuickAdd
        config={{
          type: "quick-add",
          id: "task-add",
          className: "quick-add-root",
          slots: {
            root: { className: "root-slot" },
            icon: { className: "icon-slot" },
            input: { className: "input-slot" },
            button: { className: "button-slot" },
          },
        }}
      />,
    );

    expect(container.querySelector('[data-snapshot-id="task-add"]')?.className).toContain(
      "quick-add-root",
    );
    expect(container.querySelector('[data-snapshot-id="task-add"]')?.className).toContain(
      "root-slot",
    );
    expect(container.querySelector('[data-snapshot-id="task-add-icon"]')?.className).toContain(
      "icon-slot",
    );
    expect(container.querySelector('[data-snapshot-id="task-add-input"]')?.className).toContain(
      "input-slot",
    );
    expect(container.querySelector('[data-snapshot-id="task-add-button"]')?.className).toContain(
      "button-slot",
    );
  });
});
