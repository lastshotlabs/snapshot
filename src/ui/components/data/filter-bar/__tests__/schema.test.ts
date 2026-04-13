/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from "vitest";
import { filterBarConfigSchema } from "../schema";

describe("filterBarConfigSchema", () => {
  it("accepts a minimal valid filter-bar config", () => {
    const result = filterBarConfigSchema.safeParse({
      type: "filter-bar",
      filters: [
        {
          key: "role",
          label: "Role",
          options: [
            { label: "Admin", value: "admin" },
            { label: "User", value: "user" },
          ],
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});
