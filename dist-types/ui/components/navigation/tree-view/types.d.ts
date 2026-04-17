import type { z } from "zod";
import type { treeViewConfigSchema } from "./schema";
import type { TreeItemInput } from "./schema";
/** Inferred config type from the TreeView Zod schema. */
export type TreeViewConfig = z.input<typeof treeViewConfigSchema>;
/** Re-export the tree item type for convenience. */
export type { TreeItemInput };
