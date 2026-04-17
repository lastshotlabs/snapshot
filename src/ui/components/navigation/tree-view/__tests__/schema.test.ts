import { describe, expect, it } from "vitest";
import { treeViewConfigSchema } from "../schema";

describe("treeViewConfigSchema", () => {
  it("accepts canonical tree slots and badges", () => {
    const result = treeViewConfigSchema.safeParse({
      type: "tree-view",
      items: [
        {
          label: "Docs",
          badge: "3",
          slots: {
            row: { className: "tree-row" },
            badge: { className: "tree-badge" },
          },
        },
      ],
      slots: {
        root: { className: "tree-root" },
        loadingState: { className: "tree-loading" },
        emptyState: { className: "tree-empty" },
        children: { className: "tree-children" },
      },
    });

    expect(result.success).toBe(true);
  });

  it("accepts ref-backed labels and badges", () => {
    const result = treeViewConfigSchema.safeParse({
      type: "tree-view",
      items: [
        {
          label: { from: "tree.docs" },
          badge: { from: "tree.count" },
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});
