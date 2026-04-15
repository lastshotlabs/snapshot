// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { listConfigSchema } from "../schema";

describe("listConfigSchema phase D", () => {
  it("accepts drag, drop, context menu, and polling props", () => {
    const result = listConfigSchema.safeParse({
      type: "list",
      draggable: true,
      dragGroup: "backlog",
      dropTargets: ["backlog"],
      onReorder: { type: "toast", message: "Reordered" },
      onDrop: { type: "toast", message: "Dropped" },
      contextMenu: [
        {
          type: "item",
          label: "Open",
          action: { type: "navigate", to: "/items/{id}" },
        },
      ],
      poll: { interval: 5000, pauseWhenHidden: true },
      items: [{ id: "1", title: "Item 1" }],
    });

    expect(result.success).toBe(true);
  });

  it("accepts canonical list and item slots", () => {
    const result = listConfigSchema.safeParse({
      type: "list",
      items: [
        {
          id: "1",
          title: "Item 1",
          slots: {
            item: { className: "item-slot" },
            itemTitle: { className: "item-title-slot" },
          },
        },
      ],
      slots: {
        root: { className: "root-slot" },
        list: { className: "list-slot" },
        itemBody: { className: "body-slot" },
        liveBanner: { className: "live-slot" },
        loadingItem: { className: "loading-item-slot" },
        emptyState: { className: "empty-slot" },
      },
    });

    expect(result.success).toBe(true);
  });
});
