// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { inputConfigSchema } from "../schema";

describe("inputConfigSchema", () => {
  it("accepts an input config", () => {
    const result = inputConfigSchema.safeParse({
      type: "input",
      id: "email",
      label: "Email",
      inputType: "email",
      required: true,
    });

    expect(result.success).toBe(true);
  });
});
