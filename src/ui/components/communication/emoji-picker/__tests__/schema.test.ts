// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { emojiPickerConfigSchema } from "../schema";

describe("emojiPickerConfigSchema", () => {
  it("accepts a custom emoji-only config", () => {
    const result = emojiPickerConfigSchema.safeParse({
      type: "emoji-picker",
      categories: [],
      customEmojis: [
        {
          id: "emoji-1",
          name: "Party Blob",
          shortcode: "party_blob",
          url: "https://example.com/party.png",
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});
