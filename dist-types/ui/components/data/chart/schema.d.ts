import { z } from "zod";
import type { ChartConfig } from "./types";
export declare const chartSlotNames: readonly ["root", "legend", "legendItem", "tooltip", "series", "axis", "grid"];
/**
 * Schema for a single data series in the chart.
 */
export declare const seriesConfigSchema: z.ZodObject<{
    /** Data key in each data record. */
    key: z.ZodString;
    /** Display label for this series (legend, tooltip). */
    label: z.ZodUnion<[z.ZodString, z.ZodObject<{
        from: z.ZodString;
        transform: z.ZodOptional<z.ZodEnum<["uppercase", "lowercase", "trim", "length", "number", "boolean", "string", "json", "keys", "values", "first", "last", "count", "sum", "join", "split", "default"]>>;
        transformArg: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
    }, "strict", z.ZodTypeAny, {
        from: string;
        transform?: "string" | "number" | "boolean" | "uppercase" | "lowercase" | "trim" | "length" | "json" | "keys" | "values" | "first" | "last" | "count" | "sum" | "join" | "split" | "default" | undefined;
        transformArg?: string | number | undefined;
    }, {
        from: string;
        transform?: "string" | "number" | "boolean" | "uppercase" | "lowercase" | "trim" | "length" | "json" | "keys" | "values" | "first" | "last" | "count" | "sum" | "join" | "split" | "default" | undefined;
        transformArg?: string | number | undefined;
    }>]>;
    /** CSS color value or CSS variable (e.g. "var(--sn-chart-1)"). */
    color: z.ZodOptional<z.ZodString>;
    /** Divide numeric series values before display (e.g. cents to dollars). */
    divisor: z.ZodOptional<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    label: string | {
        from: string;
        transform?: "string" | "number" | "boolean" | "uppercase" | "lowercase" | "trim" | "length" | "json" | "keys" | "values" | "first" | "last" | "count" | "sum" | "join" | "split" | "default" | undefined;
        transformArg?: string | number | undefined;
    };
    key: string;
    color?: string | undefined;
    divisor?: number | undefined;
}, {
    label: string | {
        from: string;
        transform?: "string" | "number" | "boolean" | "uppercase" | "lowercase" | "trim" | "length" | "json" | "keys" | "values" | "first" | "last" | "count" | "sum" | "join" | "split" | "default" | undefined;
        transformArg?: string | number | undefined;
    };
    key: string;
    color?: string | undefined;
    divisor?: number | undefined;
}>;
/**
 * Zod schema for the Chart component configuration.
 *
 * Renders a data visualization (bar, line, area, pie, donut) from an endpoint
 * or from-ref. Uses Recharts under the hood. Colors default to
 * `--sn-chart-1` through `--sn-chart-5` tokens.
 */
export declare const chartSchema: z.ZodType<ChartConfig>;
