// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Kanban } from "../component";
import { afterEach } from "vitest";

const executeSpy = vi.fn();
const publishSpy = vi.fn();
const useComponentDataMock = vi.fn();
const refValues: Record<string, unknown> = {
  "state.board.todo": "Backlog",
  "state.board.empty": "Nothing queued",
};

function resolveRefs<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => resolveRefs(entry)) as T;
  }
  if (value && typeof value === "object") {
    if ("from" in (value as Record<string, unknown>)) {
      return refValues[((value as unknown) as { from: string }).from] as T;
    }
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        resolveRefs(entry),
      ]),
    ) as T;
  }
  return value;
}

vi.mock("../../../_base/use-component-data", () => ({
  useComponentData: (...args: unknown[]) => useComponentDataMock(...args),
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => executeSpy,
}));

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) =>
    value && typeof value === "object" && "from" in (value as Record<string, unknown>)
      ? refValues[(value as { from: string }).from]
      : value,
  useResolveFrom: (value: unknown) => resolveRefs(value),
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

afterEach(() => {
  cleanup();
  executeSpy.mockReset();
  publishSpy.mockReset();
  useComponentDataMock.mockReset();
});

describe("Kanban", () => {
  it("renders cards and dispatches card actions", () => {
    executeSpy.mockReset();
    useComponentDataMock.mockReturnValue({
      data: [
        { id: "task-1", status: "todo", title: "Write tests", description: "Cover kanban" },
      ],
      isLoading: false,
      error: null,
    });

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
    useComponentDataMock.mockReturnValue({
      data: [
        { id: "task-1", status: "todo", title: "Write tests", description: "Cover kanban" },
      ],
      isLoading: false,
      error: null,
    });

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

  it("renders ref-backed column titles and empty copy", () => {
    useComponentDataMock.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(
      <Kanban
        config={{
          type: "kanban",
          columns: [{ key: "todo", title: { from: "state.board.todo" } as never }],
          emptyMessage: { from: "state.board.empty" } as never,
        }}
      />,
    );

    expect(screen.getByText("Backlog")).toBeTruthy();
    expect(screen.getByText("Nothing queued")).toBeTruthy();
  });
});
