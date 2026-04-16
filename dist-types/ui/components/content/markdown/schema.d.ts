import { z } from "zod";
/**
 * Zod config schema for the Markdown component.
 *
 * Renders markdown content with full GFM support and syntax highlighting.
 *
 * @example
 * ```json
 * {
 *   "type": "markdown",
 *   "content": "# Hello\n\nSome **bold** text and a [link](https://example.com)."
 * }
 * ```
 */
export declare const markdownConfigSchema: z.ZodType<Record<string, any>>;
