// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { multiSelectConfigSchema } from "../schema";

describe("multiSelectConfigSchema", () => {
  it("accepts a multi-select config", () => {
    const result = multiSelectConfigSchema.safeParse({
      type: "multi-select",
      label: "Tags",
      options: [{ label: "Bug", value: "bug" }],
      searchable: true,
    });

    expect(result.success).toBe(true);
  });
});
