import { describe, expect, it } from "vitest";
import { richTextEditorConfigSchema } from "../schema";

describe("richTextEditorConfigSchema", () => {
  it("accepts preview-only editor configs", () => {
    const result = richTextEditorConfigSchema.safeParse({
      type: "rich-text-editor",
      content: "# Hello",
      mode: "preview",
      toolbar: false,
    });

    expect(result.success).toBe(true);
  });

  it("accepts ref-backed placeholders", () => {
    const result = richTextEditorConfigSchema.safeParse({
      type: "rich-text-editor",
      placeholder: { from: "editor.placeholder" },
    });

    expect(result.success).toBe(true);
  });
});
