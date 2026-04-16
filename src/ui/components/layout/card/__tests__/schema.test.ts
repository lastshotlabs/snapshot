import { describe, expect, it } from "vitest";
import { bootBuiltins } from "../../../../manifest/boot-builtins";
import { cardConfigSchema } from "../schema";

describe("cardConfigSchema", () => {
  it("accepts background customization inherited from the base component config", () => {
    bootBuiltins();

    const result = cardConfigSchema.safeParse({
      type: "card",
      title: "Profile",
      background: {
        image: "/hero.png",
        overlay: "rgba(15, 23, 42, 0.35)",
      },
      children: [{ type: "text", value: "Hello" }],
    });

    expect(result.success).toBe(true);
  });

  it("accepts canonical slot surfaces", () => {
    bootBuiltins();

    const result = cardConfigSchema.safeParse({
      type: "card",
      children: [{ type: "text", value: "Hello" }],
      slots: {
        root: {
          className: "card-root-slot",
        },
        header: {
          className: "card-header-slot",
        },
      },
    });

    expect(result.success).toBe(true);
  });
});
