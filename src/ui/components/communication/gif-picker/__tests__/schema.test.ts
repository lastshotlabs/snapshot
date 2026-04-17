import { describe, expect, it } from "vitest";
import { gifPickerConfigSchema } from "../schema";

describe("gifPickerConfigSchema", () => {
  it("accepts resource-backed search and trending endpoints", () => {
    const result = gifPickerConfigSchema.safeParse({
      type: "gif-picker",
      searchEndpoint: {
        resource: "gifSearch",
        params: {
          limit: 24,
        },
      },
      trendingEndpoint: {
        resource: "gifTrending",
      },
    });

    expect(result.success).toBe(true);
  });

  it("accepts ref-backed placeholder and attribution", () => {
    const result = gifPickerConfigSchema.safeParse({
      type: "gif-picker",
      placeholder: { from: "gif.placeholder" },
      attribution: { from: "gif.attribution" },
    });

    expect(result.success).toBe(true);
  });

  it("accepts ref-backed static GIF titles", () => {
    const result = gifPickerConfigSchema.safeParse({
      type: "gif-picker",
      gifs: [
        {
          id: "party-parrot",
          url: "https://example.com/parrot.gif",
          title: { from: "gif.title" },
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});
