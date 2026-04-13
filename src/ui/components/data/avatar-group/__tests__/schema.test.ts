// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { avatarGroupConfigSchema } from "../schema";

describe("avatarGroupConfigSchema", () => {
  it("accepts a static avatar group config", () => {
    const result = avatarGroupConfigSchema.safeParse({
      type: "avatar-group",
      avatars: [{ name: "Ada" }, { name: "Lin" }],
    });

    expect(result.success).toBe(true);
  });
});
