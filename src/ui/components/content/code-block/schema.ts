import { z } from "zod";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the CodeBlock component.
 *
 * Defines all manifest-settable fields for a code display block
 * with optional copy button and line numbers.
 *
 * @example
 * ```json
 * {
 *   "type": "code-block",
 *   "code": "const x = 42;",
 *   "language": "typescript",
 *   "showLineNumbers": true,
 *   "title": "example.ts"
 * }
 * ```
 */
export const codeBlockConfigSchema = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("code-block"),
    /** The code content to display. Supports FromRef. */
    code: z.union([z.string(), fromRefSchema]),
    /** Language for display and syntax highlighting (e.g. "typescript", "python"). */
    language: z.string().optional(),
    /** Enable syntax highlighting via highlight.js. Default: true. */
    highlight: z.boolean().optional(),
    /** Show line numbers. Default: false. */
    showLineNumbers: z.boolean().optional(),
    /** Show copy-to-clipboard button. Default: true. */
    showCopy: z.boolean().optional(),
    /** Max height with scroll overflow. e.g. "400px". */
    maxHeight: z.string().optional(),
    /** Filename or title shown in the title bar. */
    title: z.union([z.string(), fromRefSchema]).optional(),
    /** Wrap long lines instead of horizontal scroll. Default: false. */
    wrap: z.boolean().optional(),
    slots: slotsSchema([
      "root",
      "titleBar",
      "titleMeta",
      "title",
      "language",
      "copyButton",
      "body",
      "pre",
      "lineNumbers",
      "code",
    ]).optional(),
  }).strict();
