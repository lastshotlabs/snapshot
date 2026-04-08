import { z } from "zod";
import { fromRefSchema } from "../../../manifest/schema";
import { dataSourceSchema } from "../../_base/types";
import { actionSchema } from "../../../actions/types";

/**
 * Recursive schema for a tree node item.
 * Each node can have nested children of the same shape.
 */
export const treeItemSchema: z.ZodType<TreeItemInput[]> = z.lazy(() =>
  z.array(
    z.object({
      /** Display label for the node. */
      label: z.string(),
      /** Lucide icon name. */
      icon: z.string().optional(),
      /** Value associated with this node (published on selection). */
      value: z.string().optional(),
      /** Child nodes. */
      children: treeItemSchema.optional(),
      /** Whether this node is disabled. */
      disabled: z.boolean().optional(),
      /** Whether this node starts expanded. */
      expanded: z.boolean().optional(),
    }),
  ),
);

/**
 * TypeScript type for tree item input (matches the Zod schema).
 * Defined manually because z.lazy() prevents z.infer from resolving recursion.
 */
export interface TreeItemInput {
  label: string;
  icon?: string;
  value?: string;
  children?: TreeItemInput[];
  disabled?: boolean;
  expanded?: boolean;
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
export const treeViewConfigSchema = z
  .object({
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
    // --- BaseComponentConfig fields ---
    /** Component id for publishing/subscribing. */
    id: z.string().optional(),
    /** Visibility toggle. */
    visible: z.union([z.boolean(), fromRefSchema]).optional(),
    /** Inline style overrides. */
    style: z.record(z.union([z.string(), z.number()])).optional(),
    /** Additional CSS class name. */
    className: z.string().optional(),
  })
  .strict();
