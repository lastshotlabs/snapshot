import type { z } from "zod";
import type { calendarConfigSchema, calendarEventSchema } from "./schema";
/** Inferred config type from the Calendar Zod schema. */
export type CalendarConfig = z.input<typeof calendarConfigSchema>;
/** Inferred static event type. */
export type CalendarEventConfig = z.infer<typeof calendarEventSchema>;
/** Internal resolved event used for rendering. */
export interface ResolvedEvent {
    /** Event title text. */
    title: string;
    /** Event start date. */
    date: Date;
    /** Event end date, if provided. */
    endDate?: Date;
    /** Semantic color name. */
    color: string;
    /** Whether this is an all-day event. */
    allDay: boolean;
    /** Original data record (for action context). */
    raw: Record<string, unknown>;
}
