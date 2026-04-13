// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { videoConfigSchema } from "../schema";

describe("videoConfigSchema", () => {
  it("accepts a video config", () => {
    const result = videoConfigSchema.safeParse({
      type: "video",
      src: "https://example.com/demo.mp4",
      controls: true,
    });

    expect(result.success).toBe(true);
  });
});
