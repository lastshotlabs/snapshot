// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { bootBuiltins } from "../../../../manifest/boot-builtins";
import { hoverCardConfigSchema } from "../schema";

describe("hoverCardConfigSchema", () => {
  it("accepts a hover card config", () => {
    bootBuiltins();

    const result = hoverCardConfigSchema.safeParse({
      type: "hover-card",
      trigger: { type: "markdown", content: "Open" },
      content: [{ type: "markdown", content: "Body" }],
      side: "bottom",
      slots: {
        panel: {
          className: "hover-panel",
        },
      },
    });

    expect(result.success).toBe(true);
  });
});
