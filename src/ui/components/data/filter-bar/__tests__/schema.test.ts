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

  it("accepts FromRef labels and search placeholder", () => {
    const result = filterBarConfigSchema.safeParse({
      type: "filter-bar",
      searchPlaceholder: { from: "filters.searchPlaceholder" },
      filters: [
        {
          key: "role",
          label: { from: "filters.roleLabel" },
          options: [{ label: { from: "filters.roleOption" }, value: "admin" }],
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});
