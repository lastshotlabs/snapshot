import { describe, it, expect } from "vitest";
import { feedSchema } from "../schema";

describe("feedSchema", () => {
  const baseConfig = {
    type: "feed",
    data: "GET /api/activity",
    title: "message",
  };

  it("accepts a minimal valid config", () => {
    const result = feedSchema.safeParse(baseConfig);
    expect(result.success).toBe(true);
  });

  it("applies default itemKey = 'id'", () => {
    const result = feedSchema.safeParse(baseConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.itemKey).toBe("id");
    }
  });

  it("applies default emptyMessage", () => {
    const result = feedSchema.safeParse(baseConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.emptyMessage).toBe("No activity yet");
    }
  });

  it("applies default pageSize = 20", () => {
    const result = feedSchema.safeParse(baseConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pageSize).toBe(20);
    }
  });

  it("accepts a full config", () => {
    const result = feedSchema.safeParse({
      ...baseConfig,
      id: "my-feed",
      itemKey: "uuid",
      avatar: "avatarUrl",
      description: "detail",
      timestamp: "createdAt",
      badge: {
        field: "type",
        colorMap: { error: "destructive", info: "info", success: "success" },
      },
      emptyMessage: "Nothing here",
      pageSize: 10,
    });
    expect(result.success).toBe(true);
  });

  it("accepts data as a FromRef", () => {
    const result = feedSchema.safeParse({
      ...baseConfig,
      data: { from: "some-source" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts badge without colorMap", () => {
    const result = feedSchema.safeParse({
      ...baseConfig,
      badge: { field: "status" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing data", () => {
    const result = feedSchema.safeParse({ title: "message" });
    expect(result.success).toBe(false);
  });

  it("rejects missing title", () => {
    const result = feedSchema.safeParse({ data: "GET /api/activity" });
    expect(result.success).toBe(false);
  });

  it("rejects pageSize < 1", () => {
    const result = feedSchema.safeParse({ ...baseConfig, pageSize: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer pageSize", () => {
    const result = feedSchema.safeParse({ ...baseConfig, pageSize: 1.5 });
    expect(result.success).toBe(false);
  });
});
