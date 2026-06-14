
/** Inferred config type from the MultiSelect Zod schema. */
export type MultiSelectConfig = Record<string, unknown>;

/** Normalized option shape used internally by the component. */
export interface MultiSelectOption {
  label: string;
  value: string;
  icon?: string;
  disabled?: boolean;
}
