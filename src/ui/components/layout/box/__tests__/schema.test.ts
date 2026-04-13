// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { bootBuiltins } from "../../../../manifest/boot-builtins";
import { boxConfigSchema } from "../schema";

describe("boxConfigSchema", () => {
  it("accepts a box config", () => {
    bootBuiltins();

    const result = boxConfigSchema.safeParse({
      type: "box",
      as: "section",
      children: [{ type: "markdown", content: "Hello" }],
    });

    expect(result.success).toBe(true);
  });
});
