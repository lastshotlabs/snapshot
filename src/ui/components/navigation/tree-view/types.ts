export interface TreeItemInput extends Record<string, unknown> {
  label: string;
  children?: TreeItemInput[];
}
