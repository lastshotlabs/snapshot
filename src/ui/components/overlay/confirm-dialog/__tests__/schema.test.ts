import { describe, expect, it } from "vitest";
import { confirmDialogConfigSchema } from "../schema";

describe("confirmDialogConfigSchema", () => {
  it("accepts a confirmation overlay definition", () => {
    const result = confirmDialogConfigSchema.safeParse({
      type: "confirm-dialog",
      title: "Archive item",
      description: "This item will be moved to the archive.",
      confirmLabel: "Archive",
      cancelLabel: "Cancel",
      confirmAction: { type: "close-modal", modal: "archive-dialog" },
    });

    expect(result.success).toBe(true);
  });

  it("accepts ref-backed footer labels", () => {
    const result = confirmDialogConfigSchema.safeParse({
      type: "confirm-dialog",
      title: "Archive item",
      confirmLabel: { from: "state.dialog.confirm" },
      cancelLabel: { from: "state.dialog.cancel" },
    });

    expect(result.success).toBe(true);
  });
});
