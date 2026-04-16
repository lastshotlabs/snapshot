import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { dataSourceSchema } from "../../_base/types";

/**
 * Schema for a static event definition.
 */
export const calendarEventSchema = z
  .object({
    /** Event title text. */
    title: z.string(),
    /** Event start date (ISO 8601 string). */
    date: z.string(),
    /** Event end date (ISO 8601 string). Optional for single-day events. */
    endDate: z.string().optional(),
    /** Semantic color for the event pill. */
    color: z
      .enum([
        "primary",
        "secondary",
        "success",
        "warning",
        "destructive",
        "info",
      ])
      .optional(),
    /** Whether this is an all-day event. */
    allDay: z.boolean().optional(),
  })
  .strict();

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
export const calendarConfigSchema: z.ZodType<Record<string, any>> = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("calendar"),
    /** API endpoint for events. Supports FromRef. */
    data: dataSourceSchema.optional(),
    /** Static event definitions. Used when no data endpoint is provided. */
    events: z.array(calendarEventSchema).optional(),
    /** Calendar view mode. Default: "month". */
    view: z.enum(["month", "week"]).optional(),
    /** Event title field from data response. Default: "title". */
    titleField: z.string().optional(),
    /** Event date field from data response. Default: "date". */
    dateField: z.string().optional(),
    /** Event color field from data response. */
    colorField: z.string().optional(),
    /** Action dispatched when an event is clicked. */
    eventAction: actionSchema.optional(),
    /** Action dispatched when an empty date cell is clicked. */
    dateAction: actionSchema.optional(),
    /** Show ISO week numbers in the first column. Default: false. */
    showWeekNumbers: z.boolean().optional(),
    /** Label for the "Today" button. Default: "Today". */
    todayLabel: z.string().optional(),
    slots: slotsSchema([
      "root",
      "header",
      "title",
      "navGroup",
      "navButton",
      "loadingState",
      "errorState",
      "frame",
      "scroller",
      "dayHeaderRow",
      "dayHeader",
      "weekNumber",
      "weekRow",
      "cell",
      "dateNumber",
      "currentDateNumber",
      "events",
      "event",
      "overflowMore",
      "weekDayHeader",
    ]).optional(),
  })
  .strict();
