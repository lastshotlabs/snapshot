import type { z } from "zod";
import type { statCardConfigSchema } from "./schema";

/** Inferred config type from the StatCard Zod schema. */
export type StatCardConfig = z.infer<typeof statCardConfigSchema>;

/**
 * Result returned by the StatCard headless hook or internal logic.
 * Provides all the data needed to render a stat card.
 */
export interface UseStatCardResult {
  /** Formatted display value (e.g., "$12,345", "89%"). */
  value: string | null;
  /** Raw numeric value. */
  rawValue: number | null;
  /** Display label. */
  label: string;
  /** Loading state. */
  isLoading: boolean;
  /** Error state. */
  error: Error | null;
  /** Trend info, or null if no trend configured or data unavailable. */
  trend: {
    direction: "up" | "down" | "flat";
    value: string;
    percentage: number;
    sentiment: "positive" | "negative" | "neutral";
  } | null;
  /** Refetch data. */
  refetch: () => void;
  /** The full response data (for custom rendering). */
  data: Record<string, unknown> | null;
}
