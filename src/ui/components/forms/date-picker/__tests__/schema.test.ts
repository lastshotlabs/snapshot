// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { datePickerConfigSchema } from "../schema";

describe("datePickerConfigSchema", () => {
  it("accepts a date picker config", () => {
    const result = datePickerConfigSchema.safeParse({
      type: "date-picker",
      mode: "single",
      label: "Due date",
      valueFormat: "iso",
    });

    expect(result.success).toBe(true);
  });

  it("accepts ref-backed label and placeholder values", () => {
    const result = datePickerConfigSchema.safeParse({
      type: "date-picker",
      mode: "single",
      label: { from: "form.copy.dateLabel" },
      placeholder: { from: "form.copy.datePlaceholder" },
    });

    expect(result.success).toBe(true);
  });

  it("accepts ref-backed preset labels", () => {
    const result = datePickerConfigSchema.safeParse({
      type: "date-picker",
      mode: "single",
      presets: [
        {
          label: { from: "form.copy.thisWeek" },
          start: "2026-04-13",
          end: "2026-04-19",
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});
