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

  it("accepts canonical helper and error slots", () => {
    const result = locationInputConfigSchema.safeParse({
      type: "location-input",
      searchEndpoint: { resource: "locations" },
      slots: {
        helper: { className: "helper-slot" },
        error: { className: "error-slot" },
      },
    });

    expect(result.success).toBe(true);
  });

  it("accepts ref-backed label, placeholder, and helper text", () => {
    const result = locationInputConfigSchema.safeParse({
      type: "location-input",
      searchEndpoint: { resource: "locations" },
      label: { from: "copy.locationLabel" },
      placeholder: { from: "copy.locationPlaceholder" },
      helperText: { from: "copy.locationHelper" },
    });

    expect(result.success).toBe(true);
  });
});
