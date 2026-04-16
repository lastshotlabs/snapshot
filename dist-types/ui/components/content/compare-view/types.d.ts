import type { z } from "zod";
import type { compareViewConfigSchema } from "./schema";
/** Inferred config type from the CompareView Zod schema. */
export type CompareViewConfig = z.input<typeof compareViewConfigSchema>;
/** A single line in the diff output. */
export interface DiffLine {
    /** The line type: unchanged, added, or removed. */
    type: "unchanged" | "added" | "removed";
    /** The text content of the line. */
    text: string;
    /** The line number in the left (original) pane, if applicable. */
    leftNum?: number;
    /** The line number in the right (modified) pane, if applicable. */
    rightNum?: number;
}
