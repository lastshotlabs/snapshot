// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { dataTableConfigSchema } from "../schema";

describe("dataTableConfigSchema phase D", () => {
  it("accepts drag, drop, infinite scroll, context menu, and polling props", () => {
    const result = dataTableConfigSchema.safeParse({
      type: "data-table",
      data: "GET /api/users",
      columns: "auto",
      draggable: true,
      dragGroup: "users",
      dropTargets: ["users"],
      onReorder: { type: "api", method: "POST", endpoint: "/api/reorder" },
      onDrop: { type: "toast", message: "Dropped" },
      contextMenu: [
        {
          type: "item",
          label: "Copy email",
          action: { type: "copy-to-clipboard", text: "{email}" },
        },
      ],
      poll: { interval: 5000, pauseWhenHidden: true },
      pagination: {
        type: "offset",
        pageSize: 20,
        infinite: true,
        infiniteThreshold: 300,
      },
    });

    expect(result.success).toBe(true);
  });
});
