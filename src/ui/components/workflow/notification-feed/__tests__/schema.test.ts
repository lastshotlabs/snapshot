// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { notificationFeedConfigSchema } from "../schema";

describe("notificationFeedConfigSchema", () => {
  it("accepts a notification feed config", () => {
    const result = notificationFeedConfigSchema.safeParse({
      type: "notification-feed",
      data: "/api/notifications",
      showMarkAllRead: true,
    });

    expect(result.success).toBe(true);
  });
});
