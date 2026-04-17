// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { calendarConfigSchema } from "../schema";

describe("calendarConfigSchema", () => {
  it("accepts a calendar config", () => {
    const result = calendarConfigSchema.safeParse({
      type: "calendar",
      view: "month",
      events: [{ title: "Launch", date: "2026-04-13" }],
    });

    expect(result.success).toBe(true);
  });

  it("accepts ref-backed event titles and today label", () => {
    const result = calendarConfigSchema.safeParse({
      type: "calendar",
      view: "month",
      todayLabel: { from: "state.calendar.today" },
      events: [{ title: { from: "state.calendar.launch" }, date: "2026-04-13" }],
    });

    expect(result.success).toBe(true);
  });
});
