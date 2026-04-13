// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { notificationBellConfigSchema } from "../schema";

describe("notificationBellConfigSchema", () => {
  it("accepts a notification bell config", () => {
    const result = notificationBellConfigSchema.safeParse({
      type: "notification-bell",
      count: 4,
      max: 99,
      size: "md",
    });

    expect(result.success).toBe(true);
  });
});
