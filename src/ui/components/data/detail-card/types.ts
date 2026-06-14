
export type DetailFieldFormat =
  | "text"
  | "date"
  | "number"
  | "currency"
  | "badge"
  | "boolean"
  | "avatar"
  | "progress"
  | "link"
  | "code";

export interface DetailFieldConfig {
  slots?: Record<string, Record<string, unknown>>;
}

export type DetailCardConfig = Record<string, unknown>;
export type DetailCardAction = Record<string, unknown>;
export const DetailCardSlotNames = [] as const;
export const DetailCardFieldSlotNames = [] as const;
export const DetailCardActionSlotNames = [] as const;

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
  /** Divide numeric value by this before formatting (e.g. 100 for cents → dollars). */
  divisor?: number;
  /** Resolve foreign-key values against another resource for display. */
  lookup?: {
    resource: string;
    valueField?: string;
    labelField?: string;
  };
  /** Optional field-level slot overrides. */
  slots?: DetailFieldConfig["slots"];
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

export type DetailCardSlotName = (typeof DetailCardSlotNames)[number];
export type DetailCardFieldSlotName = (typeof DetailCardFieldSlotNames)[number];
export type DetailCardActionSlotName = (typeof DetailCardActionSlotNames)[number];
