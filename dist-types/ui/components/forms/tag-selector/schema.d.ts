import { z } from "zod";
/**
 * Zod config schema for the TagSelector component.
 *
 * A tag input that allows selecting from predefined tags or creating new ones.
 * Tags display as colored pills with remove buttons.
 *
 * @example
 * ```json
 * {
 *   "type": "tag-selector",
 *   "id": "topic-tags",
 *   "label": "Topics",
 *   "tags": [
 *     { "label": "React", "value": "react", "color": "#61dafb" },
 *     { "label": "TypeScript", "value": "ts", "color": "#3178c6" }
 *   ],
 *   "allowCreate": true,
 *   "maxTags": 5
 * }
 * ```
 */
export declare const tagSelectorConfigSchema: z.ZodType<Record<string, any>>;
