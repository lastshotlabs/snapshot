import { describe, expect, it } from "vitest";
import { locationInputConfigSchema } from "../schema";

describe("locationInputConfigSchema", () => {
  it("accepts a resource-backed search endpoint", () => {
    const result = locationInputConfigSchema.safeParse({
      type: "location-input",
      searchEndpoint: {
        resource: "locations",
        params: {
          country: "us",
        },
      },
    });

    expect(result.success).toBe(true);
  });
});
