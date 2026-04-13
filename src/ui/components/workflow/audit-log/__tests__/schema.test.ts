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
});
