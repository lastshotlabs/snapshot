// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { avatarConfigSchema } from "../schema";

describe("avatarConfigSchema", () => {
  it("accepts an avatar config", () => {
    const result = avatarConfigSchema.safeParse({
      type: "avatar",
      name: "Jane Doe",
      status: "online",
    });

    expect(result.success).toBe(true);
  });
});
