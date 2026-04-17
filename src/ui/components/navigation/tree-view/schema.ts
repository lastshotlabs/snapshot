import { z } from "zod";
import { errorStateConfigSchema } from "../../../manifest/schema";
import { dataSourceSchema, fromRefSchema } from "../../_base/types";
import { actionSchema } from "../../../actions/types";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";

export const treeViewSlotNames = [
  "root",
  "loadingState",
  "loadingItem",
  "loadingMarker",
  "loadingLabel",
  "loadingLabelSecondary",
  "errorState",
  "emptyState",
  "item",
  "row",
  "label",
  "icon",
  "badge",
  "connector",
  "disclosure",
  "children",
] as const;

/**
 * Recursive schema for a tree node item.
 * Each node can have nested children of the same shape.
 */
export const treeItemSchema: z.ZodType<TreeItemInput[]> = z.lazy(() =>
  z.array(
    z.object({
      /** Display label for the node. */
      label: z.union([z.string(), fromRefSchema]),
      /** Lucide icon name. */
      icon: z.string().optional(),
      /** Optional badge displayed at the end of the row. */
      badge: z.union([z.string(), fromRefSchema]).optional(),
      /** Value associated with this node (published on selection). */
      value: z.string().optional(),
      /** Child nodes. */
      children: treeItemSchema.optional(),
      /** Whether this node is disabled. */
      disabled: z.boolean().optional(),
      /** Whether this node starts expanded. */
      expanded: z.boolean().optional(),
      slots: slotsSchema(["item", "row", "label", "icon", "badge", "connector", "disclosure", "children"]).optional(),
    }),
  ),
);

/**
 * TypeScript type for tree item input (matches the Zod schema).
 * Defined manually because z.lazy() prevents z.infer from resolving recursion.
 */
export interface TreeItemInput {
  label:
    | string
    | {
        from: string;
        transform?: string;
        transformArg?: string | number;
      };
  icon?: string;
  badge?:
    | string
    | {
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
export const treeViewConfigSchema = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("tree-view"),
    /** API endpoint to fetch tree data. */
    data: dataSourceSchema.optional(),
    /** Static tree items. */
    items: treeItemSchema.optional(),
    /** Whether items are selectable. Default: true. */
    selectable: z.boolean().optional(),
    /** Allow multiple selection. Default: false. */
    multiSelect: z.boolean().optional(),
    /** Show icons next to labels. Default: true. */
    showIcon: z.boolean().optional(),
    /** Show tree connector lines. Default: true. */
    showConnectors: z.boolean().optional(),
    /** Action dispatched on item selection. */
    action: actionSchema.optional(),
    /** Error state config. */
    error: errorStateConfigSchema.optional(),
    slots: slotsSchema(treeViewSlotNames).optional(),
  }).strict();
