import { z } from "zod";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the RichTextEditor component.
 *
 * Defines all manifest-settable fields for a CodeMirror 6-based markdown editor
 * with toolbar, preview pane, and split view support.
 *
 * @example
 * ```json
 * {
 *   "type": "rich-text-editor",
 *   "id": "content-editor",
 *   "content": "# Hello\n\nStart writing...",
 *   "mode": "split",
 *   "toolbar": ["bold", "italic", "h1", "h2", "separator", "code", "link"]
 * }
 * ```
 */
export const richTextEditorConfigSchema = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("rich-text-editor"),
    /** Initial markdown content. Can be a FromRef for dependent data. */
    content: z.union([z.string(), fromRefSchema]).optional(),
    /** Placeholder text shown when the editor is empty. */
    placeholder: z.string().optional(),
    /** Editor display mode. Default: 'edit'. */
    mode: z.enum(["edit", "preview", "split"]).optional(),
    /** Whether the editor is read-only. Can be a FromRef. */
    readonly: z.union([z.boolean(), fromRefSchema]).optional(),
    /** Toolbar configuration. `true` shows all items, `false` hides toolbar, or specify items. */
    toolbar: z
      .union([
        z.boolean(),
        z.array(
          z.enum([
            "bold",
            "italic",
            "strikethrough",
            "h1",
            "h2",
            "h3",
            "bullet-list",
            "ordered-list",
            "code",
            "code-block",
            "link",
            "quote",
            "separator",
          ]),
        ),
      ])
      .optional(),
    /** Minimum height of the editor. CSS value. */
    minHeight: z.string().optional(),
    /** Maximum height of the editor. CSS value. */
    maxHeight: z.string().optional(),
    slots: slotsSchema([
      "root",
      "toolbar",
      "toolbarGroup",
      "toolbarButton",
      "separator",
      "modeGroup",
      "modeButton",
      "content",
      "editorPane",
      "previewPane",
      "emptyPreview",
    ]).optional(),
  })
  .strict();
