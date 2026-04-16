// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { bootBuiltins } from "../../../../manifest/boot-builtins";
import { rowConfigSchema } from "../schema";

describe("rowConfigSchema", () => {
  it("accepts a row config", () => {
    bootBuiltins();

    const result = rowConfigSchema.safeParse({
      type: "row",
      gap: "md",
      children: [{ type: "markdown", content: "Hello" }],
    });

    expect(result.success).toBe(true);
  });

  it("accepts canonical slot surfaces", () => {
    bootBuiltins();

    const result = rowConfigSchema.safeParse({
      type: "row",
      children: [{ type: "markdown", content: "Hello" }],
      slots: {
        root: {
          className: "row-root-slot",
        },
        item: {
          className: "row-item-slot",
        },
      },
    });

    expect(result.success).toBe(true);
  });
});
