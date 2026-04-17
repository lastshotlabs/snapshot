// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { auditLogConfigSchema } from "../schema";

describe("auditLogConfigSchema", () => {
  it("accepts an audit log config", () => {
    const result = auditLogConfigSchema.safeParse({
      type: "audit-log",
      data: "/api/audit-log",
      userField: "user",
      actionField: "action",
    });

    expect(result.success).toBe(true);
  });

  it("accepts FromRef filter labels and options", () => {
    const result = auditLogConfigSchema.safeParse({
      type: "audit-log",
      data: "/api/audit-log",
      filters: [
        {
          field: "action",
          label: { from: "audit.filterLabel" },
          options: [{ from: "audit.filterOption" }],
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});
