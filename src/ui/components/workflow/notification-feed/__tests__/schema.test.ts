// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { notificationFeedConfigSchema } from "../schema";

describe("notificationFeedConfigSchema", () => {
  it("accepts a notification feed config", () => {
    const result = notificationFeedConfigSchema.safeParse({
      type: "notification-feed",
      data: "/api/notifications",
      showMarkAllRead: true,
      slots: {
        header: { className: "feed-header" },
        loadingState: { className: "feed-loading" },
        errorState: { className: "feed-error" },
        itemBody: { className: "feed-item-body" },
        item: { className: "feed-item" },
      },
    });

    expect(result.success).toBe(true);
  });

  it("accepts a ref-backed empty message", () => {
    const result = notificationFeedConfigSchema.safeParse({
      type: "notification-feed",
      data: "/api/notifications",
      emptyMessage: { from: "state.notifications.empty" },
    });

    expect(result.success).toBe(true);
  });
});
