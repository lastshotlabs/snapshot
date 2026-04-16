// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { componentGroupConfigSchema } from "../schema";

describe("componentGroupConfigSchema", () => {
  it("accepts a component group config", () => {
    const result = componentGroupConfigSchema.safeParse({
      type: "component-group",
      group: "hero",
      overrides: {
        title: {
          text: "New title",
        },
      },
    });

    expect(result.success).toBe(true);
  });

  it("accepts canonical root slot overrides", () => {
    const result = componentGroupConfigSchema.safeParse({
      type: "component-group",
      group: "hero",
      slots: {
        root: {
          className: "component-group-root-slot",
        },
      },
    });

    expect(result.success).toBe(true);
  });
});
