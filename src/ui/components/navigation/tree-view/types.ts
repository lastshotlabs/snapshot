
/** Inferred config type from the TreeView Zod schema. */
export type TreeViewConfig = Record<string, unknown>;

export interface TreeItemInput extends Record<string, unknown> {
  label: string;
  children?: TreeItemInput[];
}
