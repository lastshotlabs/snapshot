// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { entityPickerConfigSchema } from "../schema";

describe("entityPickerConfigSchema", () => {
  it("accepts an entity picker config", () => {
    const result = entityPickerConfigSchema.safeParse({
      type: "entity-picker",
      data: "/api/users",
      labelField: "name",
      valueField: "id",
      searchable: true,
    });

    expect(result.success).toBe(true);
  });
});
