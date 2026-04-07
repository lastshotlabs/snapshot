import type {
  DetailCardConfig,
  DetailFieldConfig,
  DetailFieldFormat,
} from "./schema";

/**
 * A resolved field ready for rendering — includes the raw value,
 * display label, and format.
 */
export interface ResolvedField {
  /** The field key from the data object. */
  field: string;
  /** Display label for the field. */
  label: string;
  /** The raw value from the data record. */
  value: unknown;
  /** How to render the value. */
  format: DetailFieldFormat;
  /** Whether to show a copy button. */
  copyable: boolean;
}

/**
 * Return type of the useDetailCard hook.
 */
export interface UseDetailCardResult {
  /** The raw record data. */
  data: Record<string, unknown> | null;
  /** Resolved fields ready for rendering. */
  fields: ResolvedField[];
  /** Resolved title string. */
  title: string | undefined;
  /** Whether data is currently loading. */
  isLoading: boolean;
  /** Error from data fetching, if any. */
  error: Error | null;
  /** Function to refetch the data. */
  refetch: () => void;
}

export type { DetailCardConfig, DetailFieldConfig, DetailFieldFormat };
