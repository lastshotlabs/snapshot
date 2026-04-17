// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { kanbanConfigSchema } from "../schema";

describe("kanbanConfigSchema", () => {
  it("accepts a kanban config", () => {
    const result = kanbanConfigSchema.safeParse({
      type: "kanban",
      columns: [{ key: "todo", title: "To Do" }],
      slots: {
        column: {
          className: "kanban-column",
          states: {
            current: { bg: "primary" },
          },
        },
      },
    });

    expect(result.success).toBe(true);
  });

  it("accepts ref-backed column titles and empty copy", () => {
    const result = kanbanConfigSchema.safeParse({
      type: "kanban",
      columns: [{ key: "todo", title: { from: "state.board.todo" } }],
      emptyMessage: { from: "state.board.empty" },
    });

    expect(result.success).toBe(true);
  });
});
