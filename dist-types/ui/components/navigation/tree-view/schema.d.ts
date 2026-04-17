import { z } from "zod";
export declare const treeViewSlotNames: readonly ["root", "loadingState", "loadingItem", "loadingMarker", "loadingLabel", "loadingLabelSecondary", "errorState", "emptyState", "item", "row", "label", "icon", "badge", "connector", "disclosure", "children"];
/**
 * Recursive schema for a tree node item.
 * Each node can have nested children of the same shape.
 */
export declare const treeItemSchema: z.ZodType<TreeItemInput[]>;
/**
 * TypeScript type for tree item input (matches the Zod schema).
 * Defined manually because z.lazy() prevents z.infer from resolving recursion.
 */
export interface TreeItemInput {
    label: string | {
        from: string;
        transform?: string;
        transformArg?: string | number;
    };
    icon?: string;
    badge?: string | {
        from: string;
        transform?: string;
        transformArg?: string | number;
    };
    value?: string;
    children?: TreeItemInput[];
    disabled?: boolean;
    expanded?: boolean;
    slots?: Partial<Record<(typeof treeViewSlotNames)[number], Record<string, unknown>>>;
}
/**
 * Zod config schema for the TreeView component.
 *
 * Defines all manifest-settable fields for a hierarchical expandable tree.
 *
 * @example
 * ```json
 * {
 *   "type": "tree-view",
 *   "items": [
 *     {
 *       "label": "Documents",
 *       "icon": "folder",
 *       "children": [
 *         { "label": "report.pdf", "icon": "file", "value": "report" }
 *       ]
 *     }
 *   ]
 * }
 * ```
 */
export declare const treeViewConfigSchema: z.ZodType<Record<string, any>>;
