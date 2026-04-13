// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { carouselConfigSchema } from "../schema";

describe("carouselConfigSchema", () => {
  it("accepts canonical carousel slots", () => {
    const result = carouselConfigSchema.safeParse({
      type: "carousel",
      children: [
        { type: "spacer", size: "sm" },
        { type: "spacer", size: "md" },
      ],
      slots: {
        viewport: {
          className: "carousel-viewport",
        },
        indicatorItem: {
          className: "carousel-indicator",
        },
      },
    });

    expect(result.success).toBe(true);
  });
});
