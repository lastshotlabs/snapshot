// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { quickAddConfigSchema } from "../schema";

describe("quickAddConfigSchema", () => {
  it("accepts a quick add config", () => {
    const result = quickAddConfigSchema.safeParse({
      type: "quick-add",
      placeholder: "Add task",
      buttonText: "Add",
    });

    expect(result.success).toBe(true);
  });
});
