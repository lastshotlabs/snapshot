import type { z } from "zod";
import type { multiSelectConfigSchema } from "./schema";

/** Inferred config type from the MultiSelect Zod schema. */
export type MultiSelectConfig = z.infer<typeof multiSelectConfigSchema>;

/** Normalized option shape used internally by the component. */
export interface MultiSelectOption {
  label: string;
  value: string;
  icon?: string;
  disabled?: boolean;
}
