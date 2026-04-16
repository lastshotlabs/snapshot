import { z } from "zod";
/**
 * Schema for a static event definition.
 */
export declare const calendarEventSchema: z.ZodObject<{
    /** Event title text. */
    title: z.ZodString;
    /** Event start date (ISO 8601 string). */
    date: z.ZodString;
    /** Event end date (ISO 8601 string). Optional for single-day events. */
    endDate: z.ZodOptional<z.ZodString>;
    /** Semantic color for the event pill. */
    color: z.ZodOptional<z.ZodEnum<["primary", "secondary", "success", "warning", "destructive", "info"]>>;
    /** Whether this is an all-day event. */
    allDay: z.ZodOptional<z.ZodBoolean>;
}, "strict", z.ZodTypeAny, {
    date: string;
    title: string;
    color?: "destructive" | "success" | "warning" | "info" | "primary" | "secondary" | undefined;
    endDate?: string | undefined;
    allDay?: boolean | undefined;
}, {
    date: string;
    title: string;
    color?: "destructive" | "success" | "warning" | "info" | "primary" | "secondary" | undefined;
    endDate?: string | undefined;
    allDay?: boolean | undefined;
}>;
/**
 * Zod config schema for the Calendar component.
 *
 * Renders a month or week view calendar with events sourced from an API
 * endpoint or static event definitions. Supports navigation between
 * months/weeks, event click actions, and date click actions.
 *
 * @example
 * ```json
 * {
 *   "type": "calendar",
 *   "data": "GET /api/events",
 *   "view": "month",
 *   "titleField": "name",
 *   "dateField": "startDate",
 *   "eventAction": { "type": "open-modal", "modal": "event-detail" }
 * }
 * ```
 */
export declare const calendarConfigSchema: z.ZodType<Record<string, any>>;
