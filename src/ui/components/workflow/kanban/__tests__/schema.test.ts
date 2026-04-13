// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { kanbanConfigSchema } from "../schema";

describe("kanbanConfigSchema", () => {
  it("accepts a kanban config", () => {
    const result = kanbanConfigSchema.safeParse({
      type: "kanban",
      columns: [{ key: "todo", title: "To Do" }],
    });

    expect(result.success).toBe(true);
  });
});
