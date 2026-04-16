/**
 * Number formatting utilities for StatCard.
 *
 * Uses `Intl.NumberFormat` for locale-aware formatting.
 * Handles currency, percentage, compact notation, and decimal precision.
 */
/** Options for `formatValue`. */
export interface FormatValueOptions {
    /** Currency code, used when format is 'currency'. Default: 'USD'. */
    currency?: string;
    /** Number of decimal places. Omit for auto. */
    decimals?: number;
    /** Prefix text to prepend to formatted value. */
    prefix?: string;
    /** Suffix text to append to formatted value. */
    suffix?: string;
}
/**
 * Format a numeric value according to the specified format type.
 *
 * @param value - The numeric value to format
 * @param format - Format type: 'number', 'currency', 'percent', 'compact', or 'decimal'
 * @param options - Additional formatting options (currency code, decimals, prefix/suffix)
 * @returns Formatted string representation
 *
 * @example
 * ```ts
 * formatValue(12345, 'currency', { currency: 'USD' })
 * // → "$12,345.00"
 *
 * formatValue(0.89, 'percent')
 * // → "89%"
 *
 * formatValue(1234567, 'compact')
 * // → "1.2M"
 * ```
 */
export declare function formatValue(value: number, format?: "number" | "currency" | "percent" | "compact" | "decimal", options?: FormatValueOptions): string;
/**
 * Auto-detect the first numeric field in a response object.
 * Iterates object keys and returns the first key whose value is a number.
 *
 * @param data - The response object to inspect
 * @returns The key of the first numeric field, or undefined if none found
 *
 * @example
 * ```ts
 * detectNumericField({ name: "Revenue", total: 12345, count: 42 })
 * // → "total"
 * ```
 */
export declare function detectNumericField(data: Record<string, unknown>): string | undefined;
/** Result of a trend calculation. */
export interface TrendResult {
    /** Direction of change. */
    direction: "up" | "down" | "flat";
    /** Absolute difference between current and comparison. */
    value: number;
    /** Percentage change from comparison to current. */
    percentage: number;
}
/**
 * Calculate trend direction, value, and percentage between current and comparison values.
 *
 * @param current - The current period value
 * @param comparison - The comparison/previous period value
 * @returns Trend direction, absolute difference, and percentage change
 *
 * @example
 * ```ts
 * calculateTrend(120, 100)
 * // → { direction: 'up', value: 20, percentage: 20 }
 *
 * calculateTrend(80, 100)
 * // → { direction: 'down', value: 20, percentage: -20 }
 * ```
 */
export declare function calculateTrend(current: number, comparison: number): TrendResult;
/**
 * Humanize a camelCase or snake_case field name into a display label.
 *
 * @param field - The field name to humanize
 * @returns A human-readable label
 *
 * @example
 * ```ts
 * humanizeFieldName("totalRevenue") // → "Total Revenue"
 * humanizeFieldName("user_count")   // → "User Count"
 * ```
 */
export declare function humanizeFieldName(field: string): string;
