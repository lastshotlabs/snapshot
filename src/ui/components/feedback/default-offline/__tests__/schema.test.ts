import { describe, expect, it } from "vitest";
import { offlineBannerConfigSchema } from "../schema";

describe("offlineBannerConfigSchema", () => {
  it("accepts offline status content", () => {
    const result = offlineBannerConfigSchema.safeParse({
      type: "offline-banner",
      title: "Offline",
      description: "Reconnect to continue.",
    });

    expect(result.success).toBe(true);
  });

  it("accepts ref-backed title and description", () => {
    const result = offlineBannerConfigSchema.safeParse({
      type: "offline-banner",
      title: { from: "copy.offline.title" },
      description: { from: "copy.offline.description" },
    });

    expect(result.success).toBe(true);
  });
});
