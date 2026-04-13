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
});
