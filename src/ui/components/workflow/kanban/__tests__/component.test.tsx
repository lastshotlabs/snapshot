// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Kanban } from "../component";

const executeSpy = vi.fn();
const publishSpy = vi.fn();

vi.mock("../../../_base/use-component-data", () => ({
  useComponentData: () => ({
    data: [
      { id: "task-1", status: "todo", title: "Write tests", description: "Cover kanban" },
    ],
    isLoading: false,
    error: null,
  }),
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => executeSpy,
}));

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
  usePublish: () => publishSpy,
}));

vi.mock("../../../../hooks/use-drag-drop", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DragOverlay: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  rectIntersection: {},
  verticalListSortingStrategy: {},
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
  useDroppable: () => ({
    setNodeRef: vi.fn(),
    isOver: false,
  }),
  useDndSensors: () => [],
  getSortableStyle: () => ({}),
}));

describe("Kanban", () => {
  it("renders cards and dispatches card actions", () => {
    executeSpy.mockReset();

    render(
      <Kanban
        config={{
          type: "kanban",
          id: "board",
          className: "kanban-root",
          columns: [{ key: "todo", title: "To Do" }],
          cardAction: { type: "open-task" } as never,
        }}
      />,
    );

    expect(screen.getByTestId("kanban").classList.contains("kanban-root")).toBe(
      true,
    );
    fireEvent.click(screen.getByText("Write tests"));

    expect(executeSpy).toHaveBeenCalledWith(
      { type: "open-task" },
      expect.objectContaining({ id: "task-1" }),
    );
  });

  it("applies canonical slot styling to column and card surfaces", () => {
    const { container } = render(
      <Kanban
        config={{
          type: "kanban",
          columns: [{ key: "todo", title: "To Do" }],
          slots: {
            column: { className: "board-column" },
            card: { className: "board-card" },
          },
        }}
      />,
    );

    expect(
      container
        .querySelector('[data-kanban-column="todo"]')
        ?.classList.contains("board-column"),
    ).toBe(true);
    expect(
      container
        .querySelector("[data-kanban-card]")
        ?.classList.contains("board-card"),
    ).toBe(true);
  });
});
